require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

async function testApiKey() {
  console.log('Testing Hugging Face API Key...');
  
  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    // Test with a simple text
    const testText = "Apple Inc. is a technology company";
    console.log('Testing with text:', testText);
    
    const response = await hf.tokenClassification({
      model: 'dbmdz/bert-large-cased-finetuned-conll03-english',
      inputs: testText,
    });
    
    console.log('\nAPI Response:', JSON.stringify(response, null, 2));
    console.log('\n✅ API Key is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Error testing API key:', error.message);
    if (error.message.includes('Invalid credentials')) {
      console.log('\nPossible issues:');
      console.log('1. API key might not be set in .env file');
      console.log('2. API key might be incorrect');
      console.log('3. .env file might be in wrong location');
      console.log('\nMake sure your .env file contains:');
      console.log('HUGGINGFACE_API_KEY=your_api_key_here');
    }
  }
}

testApiKey(); 