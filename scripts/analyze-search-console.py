"""Prioritize an actual Search Console Pages or Queries CSV export; never invent traffic."""
import argparse
import csv
import io
import unicodedata
from pathlib import Path


def normalize(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.lower()) if unicodedata.category(c) != 'Mn').strip()


def number(value):
    return float(value.replace('\u202f', '').replace('\u00a0', '').replace(' ', '').replace('%', '').replace(',', '.'))


def analyze(file):
    raw = file.read_text(encoding='utf-8-sig')
    dialect = csv.Sniffer().sniff(raw[:8192], delimiters=',;\t')
    reader = csv.DictReader(io.StringIO(raw), dialect=dialect)
    if not reader.fieldnames:
        raise ValueError('Le CSV est vide.')
    columns = {normalize(k): k for k in reader.fieldnames}
    clicks = columns.get('clics', columns.get('clicks'))
    impressions = columns.get('impressions')
    position = columns.get('position')
    if not all([clicks, impressions, position]):
        raise ValueError('Exporter le tableau Pages ou Requêtes avec Clics, Impressions et Position.')
    label = reader.fieldnames[0]
    results = []
    for row in reader:
        n, c, p = number(row[impressions]), number(row[clicks]), number(row[position])
        ctr = 100 * c / n if n else 0
        if n < 100:
            continue
        if 4 <= p <= 20:
            action = 'Examiner la réponse au besoin, les sources et les liens internes'
        elif p < 4 and ctr < 2:
            action = 'Examiner le titre et les résultats concurrents pour cette recherche'
        else:
            continue
        results.append((n, row[label], c, ctr, p, action))
    results.sort(reverse=True)
    lines = ['# Opportunités Search Console', '', 'Source : export fourni. Seuils exploratoires : au moins 100 impressions ; position moyenne 4–20, ou position < 4 et CTR < 2 %. Ce classement ne prédit pas un gain de trafic.', '', '| Page ou requête | Impressions | Clics | CTR | Position | Action à examiner |', '| --- | ---: | ---: | ---: | ---: | --- |']
    for n, text, c, ctr, p, action in results[:30]:
        safe = text.replace('|', '\\|').replace('\n', ' ')
        lines.append(f'| {safe} | {n:g} | {c:g} | {ctr:.1f} % | {p:.1f} | {action} |')
    if not results:
        lines += ['', 'Aucune ligne ne correspond à ces seuils. Cela ne signifie pas que le site ne présente aucune opportunité.']
    return '\n'.join(lines) + '\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv', type=Path, help='Export du tableau Pages ou Requêtes, en français ou anglais')
    parser.add_argument('--output', type=Path, help='Rapport Markdown facultatif, de préférence dans artifacts/')
    args = parser.parse_args()
    try:
        report = analyze(args.csv)
    except (ValueError, KeyError, OSError, csv.Error) as error:
        parser.error(str(error))
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(report, encoding='utf-8')
    else:
        print(report, end='')
