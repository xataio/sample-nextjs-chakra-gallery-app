// @ts-check
import { buildClient } from '@xata.io/client';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';

dotenv.config({
  path: '.env.local'
});

const BUTTERFLIES = [
  {
    id: 'rec_cjjcts0t25vi657kar7g',
    name: 'Butterfly on pink flower',
    image: 'butterfly_on_pink_flower.jpg',
    tags: ['brown', 'orange', 'blue']
  },
  {
    id: 'rec_cjjcudcid69somlqt0r0',
    name: 'Butterfly on rocks',
    image: 'butterfly_on_rocks.jpg',
    tags: ['black', 'orange']
  },
  {
    id: 'rec_cjjculkid69somlqt0s0',
    name: 'Butterfly on red flower',
    image: 'butterfly_on_red_flower.jpg',
    tags: ['black', 'white']
  },
  {
    id: 'rec_cjjcv4a0dc6heui1ju2g',
    name: 'Butterfly on green plant',
    image: 'butterfly_on_green_plant.jpg',
    tags: ['red', 'white', 'black']
  },
  {
    id: 'rec_cjjcvra0dc6heui1ju4g',
    name: 'Ghost-looking butterfly',
    image: 'butterfly_ghost.jpg',
    tags: ['black', 'white']
  },
  {
    id: 'rec_cjjd07sid69somlqt10g',
    name: 'Butterfly on leaf',
    image: 'butterfly_on_leaf.jpg',
    tags: ['orange', 'black', 'white']
  },
  {
    id: 'rec_cjjd0t20dc6heui1ju50',
    name: 'Butterfly on red flower',
    image: 'butterfly_on_another_red_flower.jpg',
    tags: ['white', 'black']
  },
  {
    id: 'rec_cjjd1eot25vi657karbg',
    name: 'Butterfly having lunch',
    image: 'butterfly_having_lunch.jpg',
    tags: ['beige', 'black']
  },
  {
    id: 'rec_cjjd244id69somlqt2a0',
    name: 'Polka dot butterfly',
    image: 'butterfly_polka_dot.jpg',
    tags: ['blue', 'gray']
  },
  {
    id: 'rec_cjjd2gcid69somlqt2ag',
    name: 'Butterfly on pink flower',
    image: 'butterfly_on_pink_flower.jpg',
    tags: ['white', 'black']
  },
  {
    id: 'rec_cjjd30cid69somlqt2b0',
    name: 'Butterfly chilling',
    image: 'butterfly_chilling.jpg',
    tags: ['white', 'yellow', 'orange']
  },
  {
    id: 'rec_cjjd3gkid69somlqt2bg',
    name: 'Buttefly on the ground',
    image: 'butterfly_on_ground.jpg',
    tags: ['red', 'white', 'black']
  },
  {
    id: 'rec_cjjd3sot25vi657karc0',
    name: 'Butterfly on finger',
    image: 'butterfly_on_finger.jpg',
    tags: ['blue', 'green', 'orange']
  },
  {
    id: 'rec_cjjd4egt25vi657karcg',
    name: 'Butterfly munching on a flower',
    image: 'butterfly_munching.jpg',
    tags: ['orange', 'black', 'white']
  },
  {
    id: 'rec_cjjd4t4id69somlqt2d0',
    name: 'Butterfly hanging on a limb',
    image: 'butterfly_hanging.jpg',
    tags: ['red', 'yellow', 'black', 'green']
  },
  {
    id: 'rec_cjjn1a3qdm7j0snh2i90',
    name: 'Sleepy butterfly',
    image: 'butterfly_sleeping.jpg',
    tags: ['black', 'brown', 'orange']
  },
  {
    id: 'rec_ckimbmrmefk3dnjk07n0',
    name: 'Blue morpho',
    image: 'butterfly_blue_morpho.jpg',
    tags: ['blue']
  }
];

dotenv.config(); // Load the default .env file

class XataClient extends buildClient() {
  /**
   *
   * @param {{}} options
   */
  constructor(options) {
    super({
      ...options
    });
  }
}

/**
 * @param {string} filePath
 * @return {Promise<string>}
 */
async function readDatabaseURL(filePath) {
  try {
    const json = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    return json.databaseURL;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

/**
 * @return {Promise<XataClient>}
 */
async function getXataClient() {
  // Prefer the env var, but fallback to the .xatarc file
  const dbURL = process.env.XATA_DATABASE_URL || (await readDatabaseURL('./.xatarc'));
  console.log(`❯ Connecting to database: ${dbURL}`);
  return new XataClient({
    databaseURL: dbURL,
    apiKey: process.env.XATA_API_KEY,
    branch: process.env.XATA_BRANCH || 'main'
  });
}

/**
 * @param {XataClient} xata
 * @return {Promise<boolean>}
 */
async function isDBpopulated(xata) {
  const { summaries } = await xata.db.image.summarize({
    summaries: {
      totalCount: {
        count: '*'
      }
    }
  });
  if (summaries[0].totalCount > 0) {
    return true;
  }

  return false;
}

/**
 * @param {string} filePath
 * @return {Promise<string>}
 */
async function encodeImageToBase64(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

/**
 * @param {XataClient} xata
 */
async function insertMockData(xata) {
  //const TAGS = ['orange', 'brown', 'blue', 'white', 'gray', 'green', 'red', 'yellow', 'beige'];
  const allTags = BUTTERFLIES.flatMap((butterfly) => butterfly.tags);
  const uniqueTags = [...new Set(allTags)];
  const tags = uniqueTags.map((name) => ({
    id: name,
    name
  }));
  await xata.db.tag.create(tags);

  const images = await Promise.all(
    BUTTERFLIES.map(async (item) => ({
      id: item.id,
      name: item.name,
      image: {
        name: item.image,
        enablePublicUrl: true, // XXX: ideally this would be set at the column level
        mediaType: 'image/jpeg',
        base64Content: await encodeImageToBase64('./sample-data/' + item.image)
      }
    }))
  );
  await xata.db.image.create(images);

  // junction table items
  /**
   * @type {{ image: string; tag: string; }[]}
   */
  const tagToImage = [];
  BUTTERFLIES.forEach((butterfly) => {
    butterfly.tags.forEach((tag) => {
      tagToImage.push({ image: butterfly.id, tag: tag });
    });
  });
  await xata.db['tag-to-image'].create(tagToImage);
}

export async function seed() {
  const xata = await getXataClient();
  if (await isDBpopulated(xata)) {
    console.warn('Database is not empty. Skip seeding...');
    return;
  }

  try {
    await insertMockData(xata);

    console.log(`🎉 Seed data successfully inserted!`);

    return 'success';
  } catch (err) {
    console.error('Error: ', err);
  }
}

try {
  void seed();
} catch {
  console.warn('Seeding gone wrong.');
}
