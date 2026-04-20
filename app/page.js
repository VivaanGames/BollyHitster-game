'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import songs from '../data/songs.json'

// Icons
const PlayIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const SkipIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
  </svg>
)

const MusicNoteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
)

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
  </svg>
)

const TrophyIcon = () => (
  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
)

const WINNING_CARDS = 10
const MIN_YEAR = 1950
const MAX_YEAR = 2024

export default function BollyHitster() {
  const [gameMode, setGameMode] = useState(null) // 'quick' | 'timeline' | null
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Quick mode state
  const [guessedYear, setGuessedYear] = useState(1990)
  const [showResult, setShowResult] = useState(false)
  const [resultType, setResultType] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [totalPlayed, setTotalPlayed] = useState(0)
  const [showSongTitle, setShowSongTitle] = useState(false)
  
  // Timeline mode state
  const [timeline, setTimeline] = useState([])
  const [showTimelineResult, setShowTimelineResult] = useState(false)
  const [placementCorrect, setPlacementCorrect] = useState(null)
  const [discardedCount, setDiscardedCount] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  
  // Used songs tracking
  const [usedSongIds, setUsedSongIds] = useState(new Set())

  // Get random unused song
  const getRandomSong = useCallback(() => {
    const unusedSongs = songs.filter(s => !usedSongIds.has(s.id))
    if (unusedSongs.length === 0) {
      setUsedSongIds(new Set())
      return songs[Math.floor(Math.random() * songs.length)]
    }
    return unusedSongs[Math.floor(Math.random() * unusedSongs.length)]
  }, [usedSongIds])

  // Play song on Spotify
  const playSong = () => {
    if (currentSong) {
      window.open(currentSong.spotify_url, '_blank')
      setIsPlaying(true)
    }
  }

  // ============ TIMELINE MODE LOGIC ============

  const isPlacementValid = (position, newSongYear) => {
    const leftSong = position > 0 ? timeline[position - 1] : null
    const rightSong = position < timeline.length ? timeline[position] : null
    
    const leftYear = leftSong ? leftSong.year : -Infinity
    const rightYear = rightSong ? rightSong.year : Infinity
    
    return newSongYear >= leftYear && newSongYear <= rightYear
  }

  const placeSongAtPosition = (position) => {
    if (!currentSong) return
    
    const isValid = isPlacementValid(position, currentSong.year)
    
    setShowTimelineResult(true)
    setPlacementCorrect(isValid)
    setTotalPlayed(prev => prev + 1)
    
    if (isValid) {
      const newTimeline = [...timeline]
      newTimeline.splice(position, 0, currentSong)
      setTimeline(newTimeline)
      setScore(prev => prev + 100)
      setStreak(prev => prev + 1)
      
      if (newTimeline.length >= WINNING_CARDS) {
        setGameWon(true)
      }
    } else {
      setDiscardedCount(prev => prev + 1)
      setStreak(0)
    }
  }

  const nextTimelineRound = () => {
    const song = getRandomSong()
    setCurrentSong(song)
    setUsedSongIds(prev => new Set([...prev, song.id]))
    setShowTimelineResult(false)
    setPlacementCorrect(null)
    setIsPlaying(false)
  }

  const skipTimelineSong = () => {
    setDiscardedCount(prev => prev + 1)
    setStreak(0)
    nextTimelineRound()
  }

  const startTimelineMode = () => {
    setScore(0)
    setStreak(0)
    setTotalPlayed(0)
    setDiscardedCount(0)
    setGameWon(false)
    setShowTimelineResult(false)
    setUsedSongIds(new Set())
    
    const firstSong = songs[Math.floor(Math.random() * songs.length)]
    setTimeline([firstSong])
    setUsedSongIds(new Set([firstSong.id]))
    
    const availableSongs = songs.filter(s => s.id !== firstSong.id)
    const secondSong = availableSongs[Math.floor(Math.random() * availableSongs.length)]
    setCurrentSong(secondSong)
    setUsedSongIds(new Set([firstSong.id, secondSong.id]))
    
    setGameMode('timeline')
  }

  // ============ QUICK MODE LOGIC ============

  const submitGuess = () => {
    if (!currentSong) return
    
    const actualYear = currentSong.year
    const diff = Math.abs(actualYear - guessedYear)
    
    setTotalPlayed(prev => prev + 1)
    setShowResult(true)
    
    if (diff === 0) {
      setScore(prev => prev + 100)
      setStreak(prev => prev + 1)
      setResultType('correct')
    } else if (diff <= 2) {
      setScore(prev => prev + 50)
      setStreak(prev => prev + 1)
      setResultType('close')
    } else if (diff <= 5) {
      setScore(prev => prev + 25)
      setStreak(0)
      setResultType('close')
    } else {
      setStreak(0)
      setResultType('wrong')
    }
  }

  const nextQuickRound = () => {
    const song = getRandomSong()
    setCurrentSong(song)
    setUsedSongIds(prev => new Set([...prev, song.id]))
    setShowResult(false)
    setResultType(null)
    setGuessedYear(1990)
    setIsPlaying(false)
  }

  const skipQuickSong = () => {
    setStreak(0)
    nextQuickRound()
  }

  const startQuickMode = () => {
    setScore(0)
    setStreak(0)
    setTotalPlayed(0)
    setUsedSongIds(new Set())
    
    const song = songs[Math.floor(Math.random() * songs.length)]
    setCurrentSong(song)
    setUsedSongIds(new Set([song.id]))
    
    setGameMode('quick')
  }

  // ============ RESET ============

  const resetGame = () => {
    setGameMode(null)
    setCurrentSong(null)
    setTimeline([])
    setScore(0)
    setStreak(0)
    setTotalPlayed(0)
    setDiscardedCount(0)
    setGameWon(false)
    setShowResult(false)
    setShowTimelineResult(false)
    setUsedSongIds(new Set())
    setIsPlaying(false)
  }

  // ============ WIN SCREEN (Timeline) ============

  if (gameWon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-yellow-400 mb-4 animate-bounce">
          <TrophyIcon />
        </div>
        <h1 className="text-5xl font-display font-bold text-gradient-gold mb-2">
          🎉 You Won! 🎉
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          You built a timeline of {WINNING_CARDS} songs!
        </p>
        
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-bollywood-gold">{score}</div>
            <div className="text-sm text-gray-500">Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{streak}</div>
            <div className="text-sm text-gray-500">Best Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{discardedCount}</div>
            <div className="text-sm text-gray-500">Discarded</div>
          </div>
        </div>
        
        <div className="w-full max-w-lg glass-card rounded-2xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Your Winning Timeline</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {timeline.map((song, i) => (
              <div key={song.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <span className="text-sm text-gray-500 w-6">{i + 1}.</span>
                <span className="font-bold text-bollywood-gold w-14">{song.year}</span>
                <span className="text-white text-sm truncate flex-1">{song.song_name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={resetGame}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-lg btn-glow"
        >
          Play Again
        </button>
      </div>
    )
  }

  // ============ MODE SELECTION ============

  if (!gameMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-bollywood-gold to-bollywood-accent mb-6 shadow-lg shadow-yellow-500/20">
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gradient-gold mb-3">
            BollyHitster
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Test your Bollywood music knowledge across decades!
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          {/* Quick Play */}
          <button
            onClick={startQuickMode}
            className="w-full p-6 glass-card rounded-2xl btn-glow hover:border-bollywood-gold/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bollywood-gold to-yellow-600 flex items-center justify-center text-2xl">
                🎯
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-semibold text-white group-hover:text-bollywood-gold">
                  Quick Play
                </h3>
                <p className="text-sm text-gray-400">
                  Guess the exact year • Score points
                </p>
              </div>
              <ChevronRightIcon />
            </div>
          </button>

          {/* Timeline Mode */}
          <button
            onClick={startTimelineMode}
            className="w-full p-6 glass-card rounded-2xl btn-glow hover:border-bollywood-gold/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bollywood-purple to-purple-600 flex items-center justify-center text-2xl">
                📊
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-semibold text-white group-hover:text-bollywood-gold">
                  Timeline Mode
                </h3>
                <p className="text-sm text-gray-400">
                  Build a timeline • First to {WINNING_CARDS} wins!
                </p>
              </div>
              <ChevronRightIcon />
            </div>
          </button>

          {/* Team Battle */}
          <Link
            href="/teams"
            className="w-full p-6 glass-card rounded-2xl btn-glow hover:border-bollywood-gold/50 transition-all group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center text-2xl">
                ⚔️
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-semibold text-white group-hover:text-bollywood-gold">
                  Team Battle
                </h3>
                <p className="text-sm text-gray-400">
                  2 teams compete • First to {WINNING_CARDS} wins!
                </p>
              </div>
              <ChevronRightIcon />
            </div>
          </Link>
        </div>

        <div className="mt-12 flex gap-8 text-center text-gray-500">
          <div>
            <div className="text-2xl font-bold text-bollywood-gold">{songs.length}</div>
            <div className="text-xs uppercase tracking-wider">Songs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-bollywood-gold">7</div>
            <div className="text-xs uppercase tracking-wider">Decades</div>
          </div>
        </div>
      </div>
    )
  }

  // ============ TIMELINE MODE ============

  if (gameMode === 'timeline') {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-bollywood-dark/80 border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={resetGame} className="flex items-center gap-2 text-gray-400 hover:text-white">
              <ChevronLeftIcon />
              <span className="text-sm">Menu</span>
            </button>
            <h1 className="text-lg font-display font-bold text-gradient-gold">Timeline Mode</h1>
            <div className="text-sm font-bold text-bollywood-gold">{timeline.length}/{WINNING_CARDS}</div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-bollywood-card/50 py-3 px-4">
          <div className="max-w-2xl mx-auto flex justify-between">
            <div className="flex gap-6">
              <div>
                <div className="text-xl font-bold text-bollywood-gold">{score}</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{streak}</div>
                <div className="text-xs text-gray-500">Streak</div>
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-400">{discardedCount}</div>
              <div className="text-xs text-gray-500">Discarded</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-bollywood-card">
          <div 
            className="h-full bg-gradient-to-r from-bollywood-gold to-bollywood-accent transition-all"
            style={{ width: `${(timeline.length / WINNING_CARDS) * 100}%` }}
          />
        </div>

        {/* Main Area */}
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
          {currentSong && (
            <>
              {/* Current Song Card */}
              <div className={`glass-card rounded-2xl p-5 mb-4 border ${
                showTimelineResult
                  ? placementCorrect ? 'border-green-500' : 'border-red-500'
                  : 'border-bollywood-gold/20'
              }`}>
                <div className="text-center">
                  {isPlaying && (
                    <div className="mb-4 animate-fade-in">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-gray-400 mb-3">
                        {currentSong.pack} • {currentSong.mood}
                      </div>
                      <h2 className="text-xl font-bold text-white mb-1">{currentSong.song_name}</h2>
                      <p className="text-gray-400 text-sm">{currentSong.artist}</p>
                      <p className="text-bollywood-gold text-sm">{currentSong.movie}</p>
                    </div>
                  )}

                  {!isPlaying && (
                    <div className="mb-4">
                      <div className="text-5xl mb-2">🎵</div>
                      <p className="text-gray-400">Tap to play the song!</p>
                    </div>
                  )}

                  <div className="mb-4">
                    {showTimelineResult ? (
                      <div className="text-5xl font-display font-bold text-bollywood-gold animate-fade-in">
                        {currentSong.year}
                      </div>
                    ) : (
                      <div className="text-5xl font-display font-bold text-gray-600">????</div>
                    )}
                  </div>

                  {!showTimelineResult && (
                    <button
                      onClick={playSong}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 ${
                        isPlaying
                          ? 'bg-green-600 text-white'
                          : 'bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black btn-glow'
                      }`}
                    >
                      <PlayIcon />
                      {isPlaying ? '🔊 Playing...' : '▶️ Play Song'}
                    </button>
                  )}
                </div>
              </div>

              {/* Result Message */}
              {showTimelineResult && (
                <div className={`rounded-xl p-4 mb-4 text-center animate-slide-up ${
                  placementCorrect ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
                }`}>
                  <div className="text-4xl mb-1">{placementCorrect ? '✅' : '❌'}</div>
                  <div className="font-bold text-lg">
                    {placementCorrect ? 'Correct! Card added!' : 'Wrong! Card discarded.'}
                  </div>
                </div>
              )}

              {/* Timeline with Placement Slots */}
              {!showTimelineResult && isPlaying && (
                <div className="mb-4">
                  <h3 className="text-sm text-gray-400 mb-2 text-center">
                    👆 Place in your timeline:
                  </h3>
                  
                  <div className="glass-card rounded-xl p-3 overflow-x-auto">
                    <div className="flex items-center gap-2 min-w-max">
                      <button
                        onClick={() => placeSongAtPosition(0)}
                        className="flex-shrink-0 w-14 h-16 rounded-lg border-2 border-dashed border-bollywood-gold/50 flex flex-col items-center justify-center text-bollywood-gold hover:bg-bollywood-gold/20 transition-all"
                      >
                        <span className="text-lg">⬅️</span>
                      </button>

                      {timeline.map((song, index) => (
                        <div key={song.id} className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-20 p-2 rounded-lg bg-bollywood-card border border-bollywood-gold/40 text-center">
                            <div className="text-xl font-bold text-bollywood-gold">{song.year}</div>
                            <div className="text-[9px] text-gray-400 truncate">{song.song_name}</div>
                          </div>

                          <button
                            onClick={() => placeSongAtPosition(index + 1)}
                            className="flex-shrink-0 w-14 h-16 rounded-lg border-2 border-dashed border-bollywood-gold/50 flex items-center justify-center text-bollywood-gold hover:bg-bollywood-gold/20 transition-all"
                          >
                            <span className="text-lg">{index === timeline.length - 1 ? '➡️' : '↕️'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Current Timeline (when showing result) */}
              {showTimelineResult && (
                <div className="glass-card rounded-xl p-3 mb-4">
                  <h3 className="text-sm text-gray-400 mb-2">Your Timeline ({timeline.length}/{WINNING_CARDS})</h3>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {timeline.map((song) => (
                      <div key={song.id} className="flex-shrink-0 px-3 py-2 rounded-lg bg-bollywood-card border border-bollywood-gold/30 text-center">
                        <div className="text-lg font-bold text-bollywood-gold">{song.year}</div>
                        <div className="text-[9px] text-gray-400 truncate w-14">{song.song_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!showTimelineResult ? (
                <button
                  onClick={skipTimelineSong}
                  className="w-full py-3 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
                >
                  ⏭️ Skip (Discard)
                </button>
              ) : (
                <button
                  onClick={nextTimelineRound}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-lg btn-glow"
                >
                  Next Song →
                </button>
              )}
            </>
          )}
        </main>
      </div>
    )
  }

  // ============ QUICK MODE ============

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-bollywood-dark/80 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={resetGame} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ChevronLeftIcon />
            <span className="text-sm">Menu</span>
          </button>
          <h1 className="text-lg font-display font-bold text-gradient-gold">Quick Play</h1>
          <button
            onClick={() => setShowSongTitle(!showSongTitle)}
            className={`px-3 py-1 rounded-full text-xs ${showSongTitle ? 'bg-bollywood-gold text-black' : 'bg-white/10 text-gray-400'}`}
          >
            {showSongTitle ? 'Hide' : 'Show'}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-bollywood-card/50 py-3 px-4">
        <div className="max-w-2xl mx-auto flex justify-between">
          <div className="flex gap-6">
            <div>
              <div className="text-xl font-bold text-bollywood-gold">{score}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{streak}</div>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-300">{totalPlayed}</div>
            <div className="text-xs text-gray-500">Played</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {currentSong && (
          <>
            {/* Song Card */}
            <div className={`glass-card rounded-2xl p-5 mb-4 border ${
              showResult
                ? resultType === 'correct' ? 'border-green-500' 
                  : resultType === 'close' ? 'border-yellow-500' 
                  : 'border-red-500'
                : 'border-bollywood-gold/20'
            }`}>
              <div className="text-center mb-4">
                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-gray-400 mb-3">
                  {currentSong.pack} • {currentSong.mood}
                </div>
                
                {(showSongTitle || showResult) ? (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{currentSong.song_name}</h2>
                    <p className="text-gray-400 text-sm">{currentSong.artist}</p>
                    <p className="text-bollywood-gold text-sm">{currentSong.movie}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">🎵</div>
                    <p className="text-gray-500">Listen and guess...</p>
                  </div>
                )}
              </div>

              <button
                onClick={playSong}
                className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 ${
                  isPlaying ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black btn-glow'
                }`}
              >
                <PlayIcon />
                {isPlaying ? 'Playing...' : 'Play Song'}
              </button>
            </div>

            {/* Result */}
            {showResult && (
              <div className={`rounded-xl p-4 mb-4 text-center animate-slide-up ${
                resultType === 'correct' ? 'bg-green-500/20 border border-green-500' 
                  : resultType === 'close' ? 'bg-yellow-500/20 border border-yellow-500'
                  : 'bg-red-500/20 border border-red-500'
              }`}>
                <div className="text-3xl mb-1">
                  {resultType === 'correct' ? '🎉' : resultType === 'close' ? '👏' : '😅'}
                </div>
                <div className="font-bold">
                  {resultType === 'correct' ? 'Perfect!' : resultType === 'close' ? 'So Close!' : 'Not Quite!'}
                </div>
                <div className="text-gray-300 mt-1">
                  Released in <span className="text-3xl font-bold text-bollywood-gold">{currentSong.year}</span>
                </div>
                <div className="text-sm text-gray-400">
                  You guessed {guessedYear} ({Math.abs(currentSong.year - guessedYear)} off)
                </div>
              </div>
            )}

            {/* Guess Slider */}
            {!showResult && (
              <div className="glass-card rounded-xl p-5 mb-4">
                <div className="text-center mb-4">
                  <div className="text-5xl font-display font-bold text-gradient-gold">{guessedYear}</div>
                  <div className="text-sm text-gray-500">Your Guess</div>
                </div>
                <input
                  type="range"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  value={guessedYear}
                  onChange={(e) => setGuessedYear(parseInt(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ffd700 ${((guessedYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%, rgba(255,255,255,0.1) 0%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{MIN_YEAR}</span>
                  <span>{MAX_YEAR}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showResult ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={skipQuickSong} className="py-4 rounded-xl bg-white/10 text-gray-300 flex items-center justify-center gap-2">
                  <SkipIcon /> Skip
                </button>
                <button onClick={submitGuess} className="py-4 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold btn-glow">
                  Submit
                </button>
              </div>
            ) : (
              <button onClick={nextQuickRound} className="w-full py-4 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-lg btn-glow">
                Next Song →
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}