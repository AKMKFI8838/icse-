'use server';
/**
 * @fileOverview Music service that follows the user's specified logic.
 */
import axios from 'axios';
import ytSearch from 'yt-search';

export interface Song {
  title: string;
  artist?: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

/**
 * Searches for a song using yt-search and gets a download link.
 * @param query The name of the song to search for.
 * @returns A promise that resolves to a Song object or null if not found.
 */
export async function searchAndGetSong(query: string): Promise<Song | null> {
  if (!query) {
    throw new Error('Please provide a song name.');
  }

  try {
    console.log(`[Music Service] Searching YouTube for "${query}"...`);
    
    const searchResults = await ytSearch(query);
    if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
        throw new Error('No videos found on YouTube.');
    }
    const topResult = searchResults.videos[0];

    const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;
    console.log(`[Music Service] Found video: ${topResult.title} (${videoUrl})`);
    
    const downloaderApiUrl = `https://akshit-api-pwht.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=audio`;
    
    console.log(`[Music Service] Calling downloader API: ${downloaderApiUrl}`);
    const response = await axios.get(downloaderApiUrl, { timeout: 30000 }); // 30 second timeout
        
    if (response.status !== 200 || !response.data || !response.data.file_url) {
        console.error('[Music Service] Failed to get download URL from API.', response.data);
        throw new Error('The downloader service failed to provide a link.');
    }

    const downloadUrl = response.data.file_url.replace("http:", "https:");

    console.log(`[Music Service] Successfully got download URL: ${downloadUrl}`);

    return {
      title: topResult.title,
      artist: topResult.author.name,
      thumbnailUrl: topResult.thumbnail,
      downloadUrl,
    };
    
  } catch (e: any) {
    console.error('Music Service Error:', e);
    let errorMessage = 'An unexpected error occurred while searching for the song.';
    if (axios.isAxiosError(e)) {
      if (e.code === 'ECONNABORTED') {
        errorMessage = 'The music download service took too long to respond. Please try again.';
      } else if (e.response) {
        errorMessage = `The music download service failed with status: ${e.response.status}.`;
      } else {
        errorMessage = 'A network error occurred while contacting the music service.';
      }
    } else if (e.message) {
      errorMessage = e.message;
    }
    throw new Error(errorMessage);
  }
}
