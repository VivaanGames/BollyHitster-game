import songs from '../../../data/songs.json'
import SongClient from './SongClient'

// Generate static params for all songs
export function generateStaticParams() {
  return songs.map((song) => ({
    id: song.id.toString(),
  }))
}

export default function SongPage({ params }) {
  const songId = parseInt(params.id)
  const song = songs.find(s => s.id === songId)
  
  return <SongClient song={song} songId={songId} />
}
