/**
 * Simple Quotation Parser
 * Extracts only: customer info, quotation info, and product table
 * Ignores headers, footers, and company info
 */

/**
 * Parse extracted PDF text into structured quotation data
 * @param {string} text - Raw text extracted from PDF
 * @returns {Object} - Parsed quotation data
 */
export const parseQuotationText = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      customerName: '',
      address: '',
      date: '',
      validUntil: '',
      products: [],
      discount: 0,
      taxRate: 0,
      notes: '',
      terms: ''
    };
  }

  const parsedData = {
    customerName: '',
    address: '',
    date: '',
    validUntil: '',
    products: [],
    discount: 0,
    taxRate: 0,
    notes: '',
    terms: ''
  };

  // Extract customer name (text after "To," until "Quotation Date")
  const customerMatch = text.match(/To,\s*([^Q]*?)(?=Quotation Date|$)/i);
  if (customerMatch && customerMatch[1]) {
    const customerText = customerMatch[1].trim();
    // Split by spaces
    const parts = customerText.split(/\s+/).filter(p => p.trim().length > 0);
    
    // Simple approach: first 2 words are name, rest is address
    if (parts.length >= 2) {
      parsedData.customerName = parts.slice(0, 2).join(' ').trim();
      if (parts.length > 2) {
        parsedData.address = parts.slice(2).join(' ').trim();
      }
    } else if (parts.length === 1) {
      parsedData.customerName = parts[0].trim();
    }
  }
  
  // Extract quotation date
  const dateMatch = text.match(/Quotation Date\s*[:]\s*(\d{1,2}\s+\w+\s+\d{4})/i);
  if (dateMatch && dateMatch[1]) {
    parsedData.date = formatDate(dateMatch[1]);
  }
  
  // Extract valid until date
  const validMatch = text.match(/Valid Till\s*[:]\s*(\d{1,2}\s+\w+\s+\d{4})/i);
  if (validMatch && validMatch[1]) {
    parsedData.validUntil = formatDate(validMatch[1]);
  }
  
  // Extract products (pattern: number, name, qty, unit, price, total)
  const productPattern = /(\d+)\s+([a-zA-Z\s]+?)\s+(\d+)\s+(pcs|kg|meter|set|box|hour|kwp|job)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/gi;
  let productMatch;
  while ((productMatch = productPattern.exec(text)) !== null) {
    parsedData.products.push({
      id: Date.now() + Math.random(),
      name: productMatch[2].trim(),
      quantity: parseInt(productMatch[3]) || 1,
      unit: productMatch[4].toLowerCase(),
      unitPrice: parseFloat(productMatch[5].replace(/,/g, '')) || 0
    });
  }
  
  // Extract discount
  const discountMatch = text.match(/DISCOUNT\s*[:]\s*([\d,]+\.?\d*)/i);
  if (discountMatch && discountMatch[1]) {
    parsedData.discount = parseFloat(discountMatch[1].replace(/,/g, '')) || 0;
  }
  
  // Extract tax rate
  const taxMatch = text.match(/GST\s*\((\d+)%\)/i);
  if (taxMatch && taxMatch[1]) {
    parsedData.taxRate = parseFloat(taxMatch[1]) || 0;
  }

  return parsedData;
};

/**
 * Extract customer name and address from "To," section
 */
const extractCustomerInfo = (lines) => {
  let name = '';
  let address = '';
  
  // Find "To," in the array
  let toIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('to,')) {
      toIndex = i;
      break;
    }
  }

  if (toIndex !== -1) {
    // Next item is customer name
    if (toIndex + 1 < lines.length) {
      name = lines[toIndex + 1].trim();
    }
    
    // Following items (2-3) are address, until we hit quotation metadata
    const addressLines = [];
    for (let i = toIndex + 2; i < lines.length; i++) {
      const item = lines[i].trim();
      
      // Stop at empty
      if (item.length === 0) break;
      
      // Stop if we hit quotation metadata
      if (item.toLowerCase().includes('quotation') || 
          item.toLowerCase().includes('date') ||
          item.toLowerCase().includes('valid') ||
          item.toLowerCase().includes('payment') ||
          item.toLowerCase().includes('delivery') ||
          item.toLowerCase().includes('sales') ||
          item.toLowerCase().includes('phone') ||
          item.includes('+92') ||
          item.includes('@') ||
          item.toLowerCase().includes('s.#') ||
          item.toLowerCase().includes('description')) {
        break;
      }
      
      addressLines.push(item);
      if (addressLines.length >= 2) break;
    }
    
    address = addressLines.join('\n');
  }

  return { name, address };
};

/**
 * Extract quotation dates (date and valid until)
 */
const extractQuotationDates = (lines) => {
  let date = '';
  let validUntil = '';
  
  for (const line of lines) {
    // Look for quotation date
    const dateMatch = line.match(/(?:quotation\s*date|date)[,:]\s*(\d{1,2}\s+\w+\s+\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
    if (dateMatch && !date) {
      date = formatDate(dateMatch[1]);
    }

    // Look for valid until date
    const validMatch = line.match(/(?:valid\s*until|valid\s*till|valid)[,:]\s*(\d{1,2}\s+\w+\s+\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
    if (validMatch && !validUntil) {
      validUntil = formatDate(validMatch[1]);
    }
  }

  return { date, validUntil };
};

/**
 * Extract product table from text
 */
const extractProductTable = (lines) => {
  const products = [];
  
  // Look for product table headers
  let tableStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('description') || line.includes('qty') || line.includes('unit') || line.includes('price')) {
      tableStartIndex = i;
      break;
    }
  }

  if (tableStartIndex === -1) {
    // Fallback: look for lines that look like products (number followed by text and numbers)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/\s{2,}|\t/).filter(p => p.trim().length > 0);
      
      if (parts.length >= 3) {
        const firstIsNumber = /^\d+$/.test(parts[0]);
        if (firstIsNumber) {
          const product = parseProductLine(line);
          if (product) {
            products.push(product);
          }
        }
      }
    }
    return products;
  }

  // Parse lines after table header
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop if we hit totals or terms
    if (line.toLowerCase().includes('sub total') || 
        line.toLowerCase().includes('grand total') ||
        line.toLowerCase().includes('terms') ||
        line.toLowerCase().includes('total')) {
      break;
    }
    
    // Skip empty lines
    if (line.length === 0) continue;
    
    // Skip header lines
    if (line.toLowerCase().includes('description') || 
        line.toLowerCase().includes('s.n') ||
        line.toLowerCase().includes('unit price')) {
      continue;
    }
    
    const product = parseProductLine(line);
    if (product) {
      products.push(product);
    }
  }

  return products.slice(0, 10);
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (dateStr) => {
  try {
    // Handle "26 June 2026" format
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      // Try DD-MM-YYYY or DD/MM/YYYY
      if (parts[0].length <= 2 && parts[2].length === 4) {
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        return date.toISOString().split('T')[0];
      }
      // Try YYYY-MM-DD or YYYY/MM/DD
      if (parts[0].length === 4) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toISOString().split('T')[0];
      }
    }
    
    // Handle "26 June 2026" format
    const words = dateStr.trim().split(/\s+/);
    if (words.length === 3) {
      const day = parseInt(words[0]);
      const monthStr = words[1].toLowerCase();
      const year = parseInt(words[2]);
      
      const monthIndex = monthNames.findIndex(m => m.startsWith(monthStr));
      if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
        const date = new Date(year, monthIndex, day);
        return date.toISOString().split('T')[0];
      }
    }
  } catch (e) {
    console.error('Date formatting error:', e);
  }
  return '';
};


/**
 * Parse a single product line
 */
const parseProductLine = (line, headers) => {
  // Split by multiple spaces or tabs
  const parts = line.split(/\s{2,}|\t/).filter(p => p.trim().length > 0);
  
  if (parts.length < 2) return null;
  
  // Try to identify parts based on position
  let name = '';
  let quantity = 1;
  let unit = 'pcs';
  let unitPrice = 0;
  
  // Handle format like: "1 Solar Panel 13 pcs 25,000.01 325,000.13"
  // Pattern: S.#, Name, Qty, Unit, Unit Price, Total
  if (parts.length >= 4) {
    // Check if first part is a number (S.#)
    const firstIsNumber = /^\d+$/.test(parts[0]);
    
    if (firstIsNumber) {
      // Try to find unit price and total (last two parts usually)
      const lastPart = parts[parts.length - 1].replace(/,/g, '');
      const secondLast = parts[parts.length - 2].replace(/,/g, '');
      
      if (/^\d+\.?\d*$/.test(lastPart) && /^\d+\.?\d*$/.test(secondLast)) {
        unitPrice = parseFloat(secondLast) || 0;
        // Find quantity and unit
        for (let i = 1; i < parts.length - 2; i++) {
          if (/^\d+$/.test(parts[i])) {
            quantity = parseInt(parts[i]) || 1;
            // Next part might be unit
            if (i + 1 < parts.length - 2) {
              const possibleUnit = parts[i + 1].toLowerCase();
              if (['pcs', 'kg', 'meter', 'set', 'box', 'hour', 'kwp', 'job'].includes(possibleUnit)) {
                unit = possibleUnit;
                name = parts.slice(1, i).join(' ');
              } else {
                name = parts.slice(1, i + 1).join(' ');
              }
            } else {
              name = parts.slice(1, i).join(' ');
            }
            break;
          }
        }
        
        if (!name) {
          name = parts.slice(1, parts.length - 2).join(' ');
        }
      }
    }
  }
  
  // Fallback: simple heuristic
  if (!name || name.length === 0) {
    const lastPart = parts[parts.length - 1].replace(/,/g, '');
    const secondLast = parts[parts.length - 2].replace(/,/g, '');
    
    if (/^\d+\.?\d*$/.test(lastPart)) {
      unitPrice = parseFloat(lastPart) || 0;
      
      if (/^\d+$/.test(secondLast)) {
        quantity = parseInt(secondLast) || 1;
        name = parts.slice(0, -2).join(' ');
      } else {
        name = parts.slice(0, -1).join(' ');
      }
    } else {
      name = line;
    }
  }
  
  // Extract unit from name if present
  const unitMatch = name.match(/\((pcs|kg|meter|set|box|hour|kwp|job)\)/i);
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    name = name.replace(/\(.*?\)/, '').trim();
  }
  
  if (name.length > 0) {
    return {
      id: Date.now() + Math.random(),
      name: name.substring(0, 200), // Limit length
      quantity,
      unit,
      unitPrice
    };
  }
  
  return null;
};


/**
 * Extract discount from text
 */
const extractDiscount = (lines) => {
  const patterns = [
    /discount[:\s]*(-?\d+[,.]?\d*)/i,
    /discount[:\s]*(-?\d+[,.]?\d*)\s*%/i,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          return Math.abs(value);
        }
      }
    }
  }

  return 0;
};

/**
 * Extract tax/GST rate from text
 */
const extractTaxRate = (lines) => {
  const patterns = [
    /(?:tax|gst|vat)[(:\s]*(-?\d+[,.]?\d*)\s*%/i,
    /(?:tax|gst|vat)[(:\s]*(-?\d+[,.]?\d*)/i,
    /gst\s*\((\d+)%\)/i,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          return Math.abs(value);
        }
      }
    }
  }

  return 0;
};

/**
 * Extract notes from text (phone, email, etc.)
 */
const extractNotes = (lines) => {
  const notes = [];
  
  for (const line of lines) {
    // Extract phone numbers and emails
    if (line.includes('+92') || line.includes('@')) {
      notes.push(line);
    }
  }

  return notes.join('\n').substring(0, 500);
};

/**
 * Extract terms from text
 */
const extractTerms = (lines) => {
  const terms = [];
  let inTermsSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('term') || line.toLowerCase().includes('condition')) {
      inTermsSection = true;
      continue;
    }

    if (inTermsSection) {
      if (line.length > 5) {
        terms.push(line);
      }
    }
  }

  return terms.join('\n').substring(0, 500);
};
