// Grabs the demensions and other info of a transformed image
export const fetchMetadata = async (metadataUrl: string) => {
  try {
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};
