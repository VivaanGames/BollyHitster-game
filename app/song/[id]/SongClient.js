'use client'

import { useState } from 'react'
import Link from 'next/link'

// Icons
const PlayIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
)

const MIN_YEAR = 1950
const MAX_YEAR = 2024

export default function SongClient({ song, songId }) {
  const [guessedYear, setGuessedYear] = useState(1990)
  const [showResult, setShowResult] = useState(false)
  const [resultType, setResultType] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playSong = () => {
    if (song) {
      window.open(song.spotify_url, '_blank')
      setIsPlaying(true)
    }
  }

  const submitGuess = () => {
    if (!song) return
    
    const actualYear = song.year
    const diff = Math.abs(actualYear - guessedYear)
    
    setShowResult(true)
    
    if (diff === 0) {
      setResultType('correct')
    } else if (diff <= 2) {
      setResultType('close')
    } else {
      setResultType('wrong')
    }
  }

  const resetGuess = () => {
    setShowResult(false)
    setResultType(null)
    setGuessedYear(1990)
    setIsPlaying(false)
  }

  if (!song) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6">🎵</div>
        <h1 className="text-2xl font-display font-bold text-white mb-4">Song Not Found</h1>
        <p className="text-gray-400 mb-8">This song doesn't exist in our database.</p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-semibold rounded-xl"
        >
          <HomeIcon />
          Go to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-bollywood-dark/80 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <HomeIcon />
            <span className="text-sm font-medium">Play More</span>
          </Link>
          
          <h1 className="text-lg font-display font-bold text-gradient-gold">
            BollyHitster
          </h1>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* QR Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bollywood-purple/20 border border-bollywood-purple/30 text-purple-300 text-sm mb-6">
          <span>📱</span>
          <span>QR Challenge #{songId}</span>
        </div>

        {/* Song Card */}
        <div className={`w-full glass-card rounded-3xl p-8 mb-6 text-center transition-all duration-500 ${
          showResult 
            ? resultType === 'correct' 
              ? 'border-green-500/50' 
              : resultType === 'close'
              ? 'border-yellow-500/50'
              : 'border-red-500/50'
            : 'border-bollywood-gold/20'
        }`}>
          {/* Pack Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-sm text-gray-400 mb-6">
            <span>{song.pack}</span>
            <span>•</span>
            <span className="capitalize">{song.mood}</span>
          </div>

          {/* Song Info (shown after result) */}
          {showResult && (
            <div className="animate-fade-in mb-6">
              <h2 className="text-3xl font-display font-bold text-white mb-3">
                {song.song_name}
              </h2>
              <p className="text-lg text-gray-400">{song.artist}</p>
              <p className="text-bollywood-gold mt-2">{song.movie}</p>
            </div>
          )}

          {/* Mystery state */}
          {!showResult && (
            <div className="py-6 mb-6">
              <div className="text-6xl mb-4">🎶</div>
              <p className="text-gray-400 text-lg">Listen to the song and guess the year!</p>
            </div>
          )}

          {/* Play Button */}
          <button
            onClick={playSong}
            className={`w-full py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 transition-all ${
              isPlaying
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                : 'bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black btn-glow'
            }`}
          >
            <PlayIcon />
            {isPlaying ? 'Playing on Spotify...' : 'Play Song'}
          </button>
        </div>

        {/* Result Display */}
        {showResult && (
          <div className={`w-full rounded-2xl p-6 mb-6 animate-slide-up text-center ${
            resultType === 'correct' 
              ? 'bg-green-500/20 border border-green-500/50' 
              : resultType === 'close'
              ? 'bg-yellow-500/20 border border-yellow-500/50'
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <div className="text-5xl mb-3">
              {resultType === 'correct' ? '🎉' : resultType === 'close' ? '👏' : '😅'}
            </div>
            <div className="text-2xl font-bold mb-2">
              {resultType === 'correct' 
                ? 'Perfect!' 
                : resultType === 'close' 
                ? 'So Close!' 
                : 'Not Quite!'}
            </div>
            <div className="text-gray-300 text-lg">
              Released in <span className="text-4xl font-display font-bold text-bollywood-gold">{song.year}</span>
            </div>
            <div className="text-sm text-gray-400 mt-3">
              You guessed: {guessedYear} ({Math.abs(song.year - guessedYear)} year{Math.abs(song.year - guessedYear) !== 1 ? 's' : ''} off)
            </div>
          </div>
        )}

        {/* Guess Controls */}
        {!showResult && (
          <div className="w-full space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-6xl font-display font-bold text-gradient-gold mb-2">
                  {guessedYear}
                </div>
                <div className="text-gray-500">Your Guess</div>
              </div>
              
              <input
                type="range"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={guessedYear}
                onChange={(e) => setGuessedYear(parseInt(e.target.value))}
                className="w-full h-4 bg-white/10 rounded-full appearance-none cursor-pointer accent-bollywood-gold"
                style={{
                  background: `linear-gradient(to right, #ffd700 0%, #ffd700 ${((guessedYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%, rgba(255,255,255,0.1) ${((guessedYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              
              <div className="flex justify-between text-sm text-gray-500 mt-3">
                <span>{MIN_YEAR}</span>
                <span>{MAX_YEAR}</span>
              </div>
            </div>

            <button
              onClick={submitGuess}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-xl btn-glow"
            >
              Submit Guess
            </button>
          </div>
        )}

        {/* Play Again / Home Buttons */}
        {showResult && (
          <div className="w-full space-y-3">
            <button
              onClick={resetGuess}
              className="w-full py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Try Again
            </button>
            <Link 
              href="/"
              className="block w-full py-4 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-center btn-glow"
            >
              Play More Songs →
            </Link>
          </div>
        )}

        {/* Share Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Share this URL to challenge your friends!</p>
          <p className="text-bollywood-gold mt-1 font-mono text-xs break-all">
            /song/{songId}
          </p>
        </div>
      </main>
    </div>
  )
}
