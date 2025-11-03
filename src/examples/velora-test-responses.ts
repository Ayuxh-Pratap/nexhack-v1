/**
 * Test examples showing how Velora teacher responses will look
 * These demonstrate the <text> and <sign> markup format
 */

export const veloraTestResponses = {
  greeting: `<text>
Great question! Let's start with a basic greeting. This is one of the first things you'll learn in sign language.
</text>

<sign>
HELLO
</sign>

<text>
Remember to smile and make eye contact when greeting someone. The sign should be clear and confident!
</text>`,

  nameSpelling: `<text>
Absolutely! Let's finger-spell your name. Each letter should be clear and distinct:
</text>

<sign>
A-Y-U-S-H
</sign>

<text>
Practice spelling it slowly at first, then gradually increase your speed. Remember to pause slightly between letters for clarity.
</text>`,

  weatherQuestion: `<text>
To ask about weather in a specific place, you'd start with these signs:
</text>

<sign>
WEATHER
</sign>

<sign>
MEERUT
</sign>

<text>
Then add a questioning facial expression. As for the actual weather report: it's currently sunny and 33°C in Meerut today!
</text>`,

  introduction: `<text>
Perfect! A basic introduction involves a few key signs. Let's start with the greeting:
</text>

<sign>
HELLO
</sign>

<text>
Then introduce yourself:
</text>

<sign>
MY NAME
</sign>

<text>
Followed by finger-spelling your name. After that, you can add:
</text>

<sign>
NICE MEET YOU
</sign>

<text>
Remember to maintain eye contact and use appropriate facial expressions - they're crucial in ASL!
</text>`,

  offTopic: `<text>
I'm focused on helping you learn sign language! But I can teach you how to ask about restaurants:
</text>

<sign>
RESTAURANT
</sign>

<sign>
WHERE GOOD
</sign>

<text>
You'd also add the city name and use questioning facial expressions. For specific restaurant recommendations, you might want to check local review apps!
</text>`
};

/**
 * Function to simulate AI response for testing
 */
export function getTestVeloraResponse(type: keyof typeof veloraTestResponses): string {
  return veloraTestResponses[type];
}

/**
 * Test the parser with example responses
 */
export function testVeloraParser() {
  console.log('=== Velora Parser Test ===');
  
  Object.entries(veloraTestResponses).forEach(([type, response]) => {
    console.log(`\n--- Testing ${type} ---`);
    console.log('Raw response:', response);
    
    // You can uncomment this when the parser is available in the environment
    // const parsed = parseVeloraResponse(response);
    // console.log('Parsed blocks:', parsed.blocks);
    // console.log('Sign content:', parsed.allSignContent);
  });
}
