import { useState } from 'react'

interface SearchBarProps {
  selectedTags: string[]
  setSelectedTags: (interests: string[]) => void
  placeholder?: string
}

export default function SearchBar({ selectedTags, setSelectedTags, placeholder = 'Add Filter' }: SearchBarProps) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const t = tag.trim()
    if (!t) return
    if (selectedTags.includes(t)) {
      setInput('')
      return
    }
    setSelectedTags([...selectedTags, t])
    setInput('')
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">Tags</label>
      <div className="mt-3 flex">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          onClick={() => addTag(input)}
          className="ml-2 shrink-0 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="mt-2 flex gap-2 flex-wrap">
        {selectedTags.map(tag => (
          <button
            key={tag}
            onClick={() => removeTag(tag)}
            className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600"
            aria-label={`remove ${tag}`}
          >
            <span>{tag}</span>
            <span className="ml-1 text-xs">✕</span>
          </button>
        ))}
      </div>
    </div>
  )
}
