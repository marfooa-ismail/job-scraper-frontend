import Papa from 'papaparse'

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function looksLikeHeaderLine(line) {
  return /title|company|location|date|posted|apply|salary/i.test(line)
}

function buildFallbackRows(lines) {
  const blocks = []
  let current = []

  for (const line of lines) {
    const cleaned = normalizeText(line)
    if (!cleaned) {
      if (current.length) {
        blocks.push(current)
        current = []
      }
      continue
    }

    if (current.length && (looksLikeHeaderLine(cleaned) || /^[A-Z][A-Z\s]{4,}$/.test(cleaned))) {
      blocks.push(current)
      current = [cleaned]
      continue
    }

    current.push(cleaned)
  }

  if (current.length) blocks.push(current)

  return blocks
    .map((block, index) => {
      const title = block[0] || `PDF Row ${index + 1}`
      const company = block[1] || ''
      const location = block.find((line) => /lahore|pakistan|remote|hybrid|onsite|on-site/i.test(line)) || ''
      const date_posted = block.find((line) => /\d{4}-\d{2}-\d{2}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(line)) || ''
      const job_url = block.find((line) => /https?:\/\//i.test(line)) || ''

      return {
        site: 'pdf',
        title,
        company,
        location,
        date_posted,
        job_url,
        raw_text: block.join(' | '),
      }
    })
    .filter((row) => row.raw_text)
}

export async function parsePdfFile(file) {
  // Load pdfjs dynamically
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.js',
    import.meta.url
  ).toString()
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const doc = await loadingTask.promise
  let fullText = ''
  const allLines = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map(item => item.str)
    const pageText = strings.map(normalizeText).filter(Boolean)
    allLines.push(...pageText, '')
    fullText += pageText.join(' ') + '\n'
  }

  // Try to parse extracted text as CSV first
  const asCsv = Papa.parse(fullText, { header: true, skipEmptyLines: true })
  if (asCsv && asCsv.data && asCsv.data.length && asCsv.meta && asCsv.meta.fields && asCsv.meta.fields.length > 1) {
    return asCsv.data
  }

  // If CSV parse failed, attempt to split lines and autodetect columns by commas
  const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (!lines.length) return []

  // If first line contains commas, treat as header
  if (lines[0].includes(',')) {
    const parsed = Papa.parse(lines.join('\n'), { header: true, skipEmptyLines: true })
    if (parsed.data && parsed.data.length && parsed.meta && parsed.meta.fields && parsed.meta.fields.length > 1) {
      return parsed.data
    }
  }

  // Fallback: try to extract simple key:value pairs or tabular whitespace-separated rows
  // We'll attempt to split by two or more spaces to guess columns
  const rows = lines.map(line => line.split(/\s{2,}/).map(c => c.trim()))
  // If rows look tabular, convert to objects using first row as header
  if (rows.length > 1 && rows[0].length > 1) {
    const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]+/g, '_'))
    const data = rows.slice(1).map(r => {
      const obj = {}
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = r[i] ?? ''
      }
      return obj
    })
    if (data.length) return data
  }

  return buildFallbackRows(allLines.length ? allLines : lines)
}
