"""Convert provisional patent application markdown to PDF using reportlab."""
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
from reportlab.lib import colors

INPUT = "/Users/abhishekratna/Documents/AOL AI/pmmsherpa/patent/provisional-application.md"
OUTPUT = "/Users/abhishekratna/Documents/AOL AI/pmmsherpa/patent/provisional-application.pdf"

def read_markdown(path):
    with open(path, 'r') as f:
        return f.read()

def clean_md(text):
    """Convert markdown bold/italic to reportlab markup."""
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    text = text.replace('&', '&amp;')
    # Fix ampersand in already-converted tags
    text = text.replace('&amp;amp;', '&amp;')
    return text

def build_pdf():
    md = read_markdown(INPUT)

    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        topMargin=1*inch,
        bottomMargin=1*inch,
        leftMargin=1*inch,
        rightMargin=1*inch,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'PatentTitle',
        parent=styles['Title'],
        fontSize=16,
        leading=20,
        spaceAfter=12,
        alignment=TA_CENTER,
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontSize=14,
        leading=18,
        spaceBefore=18,
        spaceAfter=8,
        textColor=colors.black,
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        spaceBefore=14,
        spaceAfter=6,
        textColor=colors.black,
    )

    h3_style = ParagraphStyle(
        'H3',
        parent=styles['Heading3'],
        fontSize=11,
        leading=14,
        spaceBefore=10,
        spaceAfter=4,
        textColor=colors.black,
    )

    body_style = ParagraphStyle(
        'PatentBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        spaceAfter=6,
        alignment=TA_JUSTIFY,
    )

    bullet_style = ParagraphStyle(
        'PatentBullet',
        parent=body_style,
        leftIndent=20,
        bulletIndent=10,
        spaceAfter=4,
    )

    code_style = ParagraphStyle(
        'Code',
        parent=styles['Code'],
        fontSize=7.5,
        leading=10,
        leftIndent=10,
        spaceAfter=8,
        spaceBefore=4,
        backColor=colors.Color(0.95, 0.95, 0.95),
    )

    elements = []

    lines = md.split('\n')
    i = 0
    in_code_block = False
    code_lines = []

    while i < len(lines):
        line = lines[i]

        # Code block handling
        if line.strip().startswith('```'):
            if in_code_block:
                # End code block
                code_text = '\n'.join(code_lines)
                if code_text.strip():
                    elements.append(Preformatted(code_text, code_style))
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Skip horizontal rules
        if line.strip() == '---':
            elements.append(Spacer(1, 8))
            i += 1
            continue

        # Empty line
        if not line.strip():
            i += 1
            continue

        # Title (# )
        if line.startswith('# '):
            text = clean_md(line[2:].strip())
            elements.append(Paragraph(text, title_style))
            i += 1
            continue

        # H2 (## )
        if line.startswith('## '):
            text = clean_md(line[3:].strip())
            elements.append(Paragraph(text, h1_style))
            i += 1
            continue

        # H3 (### )
        if line.startswith('### '):
            text = clean_md(line[4:].strip())
            elements.append(Paragraph(text, h2_style))
            i += 1
            continue

        # H4+
        if line.startswith('#### '):
            text = clean_md(line[5:].strip())
            elements.append(Paragraph(text, h3_style))
            i += 1
            continue

        # Table detection
        if '|' in line and i + 1 < len(lines) and '---' in lines[i + 1]:
            # Parse table
            table_data = []
            headers = [c.strip() for c in line.split('|') if c.strip()]
            table_data.append(headers)
            i += 2  # skip header and separator
            while i < len(lines) and '|' in lines[i] and lines[i].strip():
                row = [c.strip() for c in lines[i].split('|') if c.strip()]
                table_data.append(row)
                i += 1

            if table_data:
                # Convert to Paragraphs for wrapping
                formatted_data = []
                for ri, row in enumerate(table_data):
                    formatted_row = []
                    for cell in row:
                        cell_text = clean_md(cell)
                        style = body_style if ri > 0 else ParagraphStyle('TableHeader', parent=body_style, fontName='Helvetica-Bold')
                        formatted_row.append(Paragraph(cell_text, style))
                    formatted_data.append(formatted_row)

                col_count = len(formatted_data[0]) if formatted_data else 0
                col_width = (6.5 * inch) / max(col_count, 1)

                t = Table(formatted_data, colWidths=[col_width] * col_count)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.9, 0.9, 0.9)),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(Spacer(1, 4))
                elements.append(t)
                elements.append(Spacer(1, 4))
            continue

        # Bullet points
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            text = clean_md(line.strip()[2:])
            elements.append(Paragraph(f'• {text}', bullet_style))
            i += 1
            continue

        # Numbered list
        m = re.match(r'^\s*(\d+)\.\s+(.+)', line)
        if m:
            num = m.group(1)
            text = clean_md(m.group(2))
            elements.append(Paragraph(f'{num}. {text}', bullet_style))
            i += 1
            continue

        # Regular paragraph - collect consecutive lines
        para_lines = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith('#') and not lines[i].startswith('```') and not lines[i].strip().startswith('- ') and not lines[i].strip().startswith('* ') and not re.match(r'^\s*\d+\.\s+', lines[i]) and lines[i].strip() != '---' and '|' not in lines[i]:
            para_lines.append(lines[i])
            i += 1

        text = clean_md(' '.join(l.strip() for l in para_lines))
        elements.append(Paragraph(text, body_style))

    doc.build(elements)
    print(f"PDF created: {OUTPUT}")

if __name__ == '__main__':
    build_pdf()
