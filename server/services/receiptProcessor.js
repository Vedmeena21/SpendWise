const Tesseract = require('tesseract.js');
const { HfInference } = require('@huggingface/inference');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const extractDateFromText = (text) => {
  console.log('\n📅 Starting date extraction...');
  // Common date patterns
  const datePatterns = [
    /\d{2}[-/]\d{2}[-/]\d{4}/,  // DD/MM/YYYY or DD-MM-YYYY
    /\d{4}[-/]\d{2}[-/]\d{2}/,  // YYYY/MM/DD or YYYY-MM-DD
    /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/, // D/M/YY or D-M-YYYY
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      console.log('✅ Date found:', match[0]);
      // Convert to YYYY-MM-DD format
      const date = new Date(match[0]);
      return date.toISOString().split('T')[0];
    }
  }
  console.log('⚠️ No date found in text');
  return null;
};

const extractTotalFromText = (text) => {
  console.log('\n💰 Starting total amount extraction...');
  // Look for common total amount patterns
  const totalPatterns = [
    /total[\s:]*[$€£]?\s*\d+[.,]\d{2}/i,
    /[$€£]\s*\d+[.,]\d{2}/,
    /\btotal\b.*?\d+[.,]\d{2}/i
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract the number from the match
      const number = match[0].match(/\d+[.,]\d{2}/)[0];
      const total = parseFloat(number.replace(',', '.'));
      console.log('✅ Total amount found:', total);
      return total;
    }
  }
  console.log('⚠️ No total amount found in text');
  return null;
};

const extractMerchantName = async (text) => {
  console.log('\n🏪 Starting merchant name extraction...');
  try {
    console.log('Analyzing first line of text:', text.split('\n')[0]);
    // Use Hugging Face model to identify organization names
    const response = await hf.tokenClassification({
      model: 'dbmdz/bert-large-cased-finetuned-conll03-english',
      inputs: text.split('\n')[0], // Usually merchant name is at the top
    });

    // Find organization entities
    const orgEntities = response.filter(entity => entity.entity_group === 'ORG');
    if (orgEntities.length > 0) {
      const merchantName = text.slice(orgEntities[0].start, orgEntities[0].end);
      console.log('✅ Merchant name found using NER:', merchantName);
      return merchantName;
    }
    
    // Fallback: return first line if no organization found
    const firstLine = text.split('\n')[0].trim();
    console.log('⚠️ No organization found, using first line:', firstLine);
    return firstLine;
  } catch (error) {
    console.error('❌ Error extracting merchant name:', error);
    return null;
  }
};

const extractItems = (text) => {
  console.log('\n📝 Starting items extraction...');
  const lines = text.split('\n');
  const items = [];
  
  const pricePattern = /\d+[.,]\d{2}/;
  
  for (const line of lines) {
    // Skip lines that look like headers or totals
    if (line.toLowerCase().includes('total') || 
        line.toLowerCase().includes('subtotal') ||
        line.trim().length < 5) {
      continue;
    }
    
    const prices = line.match(new RegExp(pricePattern, 'g'));
    if (prices && prices.length > 0) {
      const price = parseFloat(prices[prices.length - 1].replace(',', '.'));
      const name = line.replace(new RegExp(pricePattern, 'g'), '').trim();
      
      items.push({ name, price });
      console.log('📌 Found item:', name, '- Price:', price);
    }
  }
  
  console.log(`✅ Extracted ${items.length} items`);
  return items;
};

const processReceipt = async (filePath) => {
  console.log('\n🔄 Starting receipt processing...');
  console.log('📄 Processing file:', filePath);
  
  try {
    // Perform OCR
    console.log('\n👁️ Starting OCR processing...');
    const result = await Tesseract.recognize(
      filePath,
      'eng',
      { 
        logger: info => {
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${(info.progress * 100).toFixed(2)}%`);
          }
        }
      }
    );

    console.log('✅ OCR completed successfully');
    const text = result.data.text;
    console.log('\n📃 Extracted text sample (first 100 chars):', text.substring(0, 100));
    
    // Extract structured data
    console.log('\n🔍 Starting data extraction...');
    const merchant = await extractMerchantName(text);
    const date = extractDateFromText(text);
    const total = extractTotalFromText(text);
    const items = extractItems(text);

    console.log('\n✨ Receipt processing completed successfully');
    
    const extractedData = {
      merchant,
      date,
      total,
      items,
      // Additional metadata
      rawText: text,
      confidence: result.data.confidence
    };

    console.log('\n📊 Extraction Summary:');
    console.log('- Confidence:', result.data.confidence);
    console.log('- Merchant:', merchant);
    console.log('- Date:', date);
    console.log('- Total:', total);
    console.log('- Items:', items.length);

    return extractedData;
  } catch (error) {
    console.error('\n❌ Error processing receipt:', error);
    throw error;
  }
};

module.exports = {
  processReceipt
}; 