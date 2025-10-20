import { GoogleGenAI, Modality } from "@google/genai";

const uploadContainer = document.getElementById('upload-container');
const fileInput = document.getElementById('file-input');

// Store the last uploaded image data
let storedBase64Data: string | null = null;
let storedMimeType: string | null = null;

const prompt = `Create a black-and-white, high-resolution half-body portrait of a person based on the uploaded photo, reimagined as a Macedonian man or woman from around 1920 — such as a vojvoda (freedom fighter), teacher, professor, or citizen.

Keep the person’s core facial likeness (eyes, nose, mouth structure) and realistic proportions, but introduce creative variation in hair and facial hair as instructed below.

Show the subject from the waist up, facing randomly left, right, or center (¾ profile or frontal).

Background: plain white or light-gray studio wall, typical of a small Macedonian photo atelier — no scenery or props.

🧔 CRITICAL RULE: Facial Hair Randomization for Men
This is the most important rule for male subjects. You MUST introduce random variation in facial hair. DO NOT just copy the facial hair from the uploaded photo.
1.  Analyze the uploaded photo.
2.  If the subject is male, you MUST randomly choose ONE of the following options for the generated portrait:
    - Option A: Add a mustache (style appropriate for 1920s Macedonia).
    - Option B: Add a full beard (style appropriate for 1920s Macedonia).
    - Option C: Make the subject completely clean-shaven.
3.  This decision must be random for EVERY generation. For example, if the original person has a beard, you might generate one version clean-shaven, and the next with only a mustache. If the original is clean-shaven, you must sometimes add a beard or mustache. This variation is mandatory.

👔 Authentic & Logical Attire Variation Rules

Every portrait must show clothing that is typical for the person’s role or background, but with natural variations so no two outfits look identical.

Professors, teachers, and urban citizens (male):

Usually wear early-20th-century urban attire, but vary formality.
Some portraits may show only a shirt with rolled sleeves or open collar; others may include a vest, jacket, or tie.
Alternate between: plain shirt (no tie), shirt + vest (no jacket), shirt + tie + jacket, vest + tie (no jacket).
Randomly include or omit small accessories (pocket watch, glasses, hat).
Fabrics: cotton, wool, or linen — modest, not luxurious.

Vojvodi and folk men:

Wear traditional Macedonian garments: embroidered shirt, wool vest (elek), wide sash (pojas), cloth trousers (čakširi).
Vary completeness: sometimes full folk outfit, sometimes only shirt + pojas, or shirt + vest.
Do not repeat identical combinations; keep them believable for the 1920s countryside.

Women (folk and urban):

Alternate between folk blouses with apron/scarf and modest urban blouses or dresses from the 1920s.
Randomly choose whether jewelry, scarf, or vest is present.

General rules:

No foreign military or official uniforms.
Outfits must always appear complete and modest, never missing logical elements.
Randomize sleeve length, buttoning, layering, and accessories so every image feels like a different person photographed on a different day.

The goal is authentic variation within Macedonian fashion of the 1920s — realistic, historically appropriate, and visually diverse.

⚠️ Cultural Context

Do not include any Serbian, Bulgarian, Greek, or Ottoman military symbols, caps, or uniforms.

The portrait must represent civilian Macedonian identity.

🖼️ The image should look like a scanned studio photograph from the 1920s, with film grain, paper texture, gentle fading, and soft contrast, like an archival family portrait.

📜 Caption Generation Rules

Write a caption below the image in the format:
Name Surname — "Nickname"

First and last names must sound authentically Macedonian. For each new generation, you MUST generate a new, random, and unique name combination. Do not repeat names.
Here are some examples of names to guide you, but do not limit yourself to them:
Male First Names: Jovan, Stefan, Gjorgi, Petar, Nikola, Aleksandar, Zoran, Dragan, Igor, Ljupčo, Goran.
Male Last Names: Stojanovski, Jovanovski, Angelov, Dimitrov, Popovski, Trajkov, Damjanov, Blazev, Krstev, Mitrev.
Female First Names: Marija, Elena, Vera, Biljana, Violeta, Vesna, Svetlana, Liljana, Anita, Gordana.
Female Last Names: Petrovska, Nikolovska, Stojanovska, Ivanovska, Trajkovska, Angelovska, Popovska, Ristevska.


The nickname must be selected from the fixed list below and written exactly as it appears — letter for letter.

Never modify, add, repeat, or remove any letters.

Never create new nicknames.

If unsure, copy it exactly. Do not stylize or re-spell it.

Allowed nicknames (copy exactly as written):
“Šatkata”, “Hrabarot”, “Tivkata”, “Vezilkata”, “Planinskiot”, “Debranecot”, “Svetkata”, “Blagovska”, “Kitec”, “Tihiot”, “Zmejot”, “Cvetkata”, “Lisecot”, “Vodenecot”, “Zlatkata”, “Veseliot”, “Pojasot”, “Kamenskiot”, “Marievska”, “Pelagonskiot”, “Golemot”, “Maliot”, “Zborot”, “Pismoto”, “Vardarot”, “Tikveskiot”, “Bitolceto”, “Zlatenot”, “Trnkata”, “Lučkata”.

Use only Macedonian Latin alphabet: A–Z plus Č, Š, Ž, Dj.

Do not use Ć or Đ (Serbian letters).

Do not double or stylize letters (e.g. “Šaatkata”, “Hrraabarot”).

No mixed alphabets or decorative spelling.

All text must appear neutral, clean, and simple — no cursive, faux-vintage, or decorative scripts.

The caption must look clean, historically consistent, and perfectly spelled.

Example outputs:
Jovan Dimitrov — "Šatkata"
Vera Trajkovska — "Tivkata"
Gjorgi Mitrev — "Debranecot"
Petar Krstev — "Hrabarot"

🔤 Alphabet and Language Rules

All written text must use the Macedonian Latin alphabet only.

Allowed characters: A–Z, a–z, Č, Š, Ž, Dj.

Forbidden: all Cyrillic letters, any decorative or stylized glyphs, and all foreign characters (Ć, Đ, Ŝ, Ż, Ą, Ł, ß, etc.).

No mixed alphabets. Every word must use only one alphabet.

If unsure about a letter, default to plain Macedonian Latin.

Do not simulate cursive or historical writing. Keep it clear and modern.

Do not use numbers, symbols, or substitute characters inside names.

The caption must appear legible, clean, and correctly typed.

Each generated portrait must be unique, historically accurate, linguistically correct, and visually authentic to Macedonia circa 1920.

Style: authentic Macedonian studio portrait, half-body, plain white background, random logical attire combinations, scanned black-and-white texture, caption in Macedonian Latin alphabet.

✅ This version now ensures:

No Cyrillic or English letter blending (e.g. А / A, С / C, Р / P).

No decorative or calligraphic distortions.

Only allowed Macedonian Latin characters.

Clean, neutral printed captions — exactly like an archival label.`;

async function generateImage(base64Data: string, mimeType: string) {
  if (!uploadContainer) return;

  // Show loading spinner
  uploadContainer.innerHTML = `
    <div class="loader"></div>
    <p>Generating your portrait...</p>
  `;
  uploadContainer.style.cursor = 'default';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Create a random number for both the seed and prompt injection
    const randomNumber = Math.floor(Math.random() * 1000000);
    
    // Inject randomness into the prompt text itself
    const dynamicPrompt = `${prompt}\n\nInternal generation seed: ${randomNumber}. Ensure maximum variation from any previous generation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: dynamicPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
        temperature: 1, // Max randomness
        topP: 1, // Max randomness
        topK: 64, // Widen the token selection pool
        seed: randomNumber, // Use the same random number for the API seed
      },
    });

    let generatedImageBase64 = '';
    let caption = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
            generatedImageBase64 = part.inlineData.data;
        }
        if (part.text) {
            caption = part.text;
        }
    }

    if (generatedImageBase64) {
      const img = document.createElement('img');
      img.src = `data:image/png;base64,${generatedImageBase64}`;
      img.alt = 'Generated Portrait';
      img.id = 'generated-image';
      
      const captionElement = document.createElement('p');
      captionElement.className = 'caption';
      captionElement.textContent = caption;

      // --- Action Buttons ---
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'actions-container';

      // Download Button
      const downloadButton = document.createElement('button');
      downloadButton.className = 'action-button';
      downloadButton.innerHTML = `<i class="fa-solid fa-download"></i> Download Image`;
      downloadButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = img.src;
        const filename = (caption || 'macedonian_portrait').replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '_') + '.png';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // Generate New Button
      const generateNewButton = document.createElement('button');
      generateNewButton.className = 'action-button';
      generateNewButton.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate New`;
      generateNewButton.addEventListener('click', () => {
        if(storedBase64Data && storedMimeType) {
            generateImage(storedBase64Data, storedMimeType);
        }
      });

      // Upload New Button
      const uploadNewButton = document.createElement('button');
      uploadNewButton.className = 'action-button';
      uploadNewButton.innerHTML = `<i class="fa-solid fa-upload"></i> Upload New Photo`;
      uploadNewButton.addEventListener('click', showInitialUI);

      actionsContainer.appendChild(downloadButton);
      actionsContainer.appendChild(generateNewButton);
      actionsContainer.appendChild(uploadNewButton);

      uploadContainer.innerHTML = '';
      uploadContainer.appendChild(img);
      uploadContainer.appendChild(captionElement);
      uploadContainer.appendChild(actionsContainer);

    } else {
        throw new Error("Image generation failed. No image data received.");
    }
  } catch (error) {
    console.error('Error generating image:', error);
    uploadContainer.innerHTML = `
        <p>Sorry, something went wrong.</p>
        <p>Please try again.</p>
        <div class="actions-container">
            <button id="upload-new-error-btn" class="action-button">
                <i class="fa-solid fa-upload"></i> Upload New Photo
            </button>
        </div>
    `;
    document.getElementById('upload-new-error-btn')?.addEventListener('click', showInitialUI);
  }
}

function showInitialUI() {
    if (!uploadContainer) return;
    uploadContainer.innerHTML = `
        <button id="upload-button" aria-label="Upload Photo">
            <i class="fa-solid fa-image"></i>
        </button>
        <p>Upload photo</p>
    `;
    uploadContainer.style.cursor = 'pointer';
    (fileInput as HTMLInputElement).value = ''; // Reset file input
}

if (uploadContainer && fileInput) {
    // Set initial state
    showInitialUI();

    uploadContainer.addEventListener('click', (e) => {
        // Only trigger click if the upload button is present
        if ((e.target as HTMLElement).closest('#upload-button') || e.currentTarget === uploadContainer && document.getElementById('upload-button')) {
             (fileInput as HTMLInputElement).click();
        }
    });

    fileInput.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    // result is a data URL like "data:image/jpeg;base64,..."
                    storedBase64Data = result.split(',')[1];
                    storedMimeType = file.type;
                    generateImage(storedBase64Data, storedMimeType);
                };
                
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file.');
            }
        }
    });
}
