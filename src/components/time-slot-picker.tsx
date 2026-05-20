"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TimeSlotPickerProps {
  value: string[]
  onChange: (value: string[]) => void
}

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAY_LABELS: Record<string, string> = { mon: '周一', tue: '周二', wed: '周三', thu: '周四', fri: '周五', sat: '周六', sun: '周日' }

function formatTimeSummary(value: string[]): string {
  if (value.length === 0) return '未配置'
  if (value.length >= 7 * 24) return '全周全天'

  // Group by day
  const byDay: Record<string, number[]> = {}
  for (const v of value) {
    const [dayKey, hourStr] = v.split('-')
    const hour = parseInt(hourStr)
    if (!byDay[dayKey]) byDay[dayKey] = []
    byDay[dayKey].push(hour)
  }

  const parts: string[] = []
  const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  for (const dayKey of dayOrder) {
    const hours = byDay[dayKey]
    if (!hours || hours.length === 0) continue
    hours.sort((a, b) => a - b)

    // Merge consecutive hours into ranges
    const ranges: [number, number][] = []
    let start = hours[0]
    let end = hours[0]
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === end + 1) {
        end = hours[i]
      } else {
        ranges.push([start, end + 1])
        start = hours[i]
        end = hours[i]
      }
    }
    ranges.push([start, end + 1])

    const rangeStrs = ranges.map(([s, e]) =>
      `${String(s).padStart(2, '0')}:00-${String(e).padStart(2, '0')}:00`
    )
    parts.push(`${DAY_LABELS[dayKey]} ${rangeStrs.join('、')}`)
  }

  const text = parts.join('；')
  return text.length > 50 ? text.slice(0, 50) + '...' : text
}

export function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  const [open, setOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')
  const gridRef = useRef<HTMLDivElement>(null)

  const slotKey = useCallback((day: number, hour: number) => `${DAY_KEYS[day]}-${hour}`, [])

  const isActive = useCallback((day: number, hour: number) => {
    return value.includes(slotKey(day, hour))
  }, [value, slotKey])

  const toggleSlot = useCallback((day: number, hour: number) => {
    const key = slotKey(day, hour)
    if (value.includes(key)) {
      onChange(value.filter((v) => v !== key))
    } else {
      onChange([...value, key])
    }
  }, [value, onChange, slotKey])

  const handleMouseDown = useCallback((day: number, hour: number, e: React.MouseEvent) => {
    e.preventDefault()
    const active = isActive(day, hour)
    setDragMode(active ? 'remove' : 'add')
    setIsDragging(true)
    toggleSlot(day, hour)
  }, [isActive, toggleSlot])

  const handleMouseEnter = useCallback((day: number, hour: number) => {
    if (!isDragging) return
    const key = slotKey(day, hour)
    const active = value.includes(key)
    if (dragMode === 'add' && !active) {
      onChange([...value, key])
    } else if (dragMode === 'remove' && active) {
      onChange(value.filter((v) => v !== key))
    }
  }, [isDragging, dragMode, slotKey, value, onChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Batch actions
  const setAll = useCallback(() => {
    const keys: string[] = []
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        keys.push(slotKey(d, h))
      }
    }
    onChange(keys)
  }, [onChange, slotKey])

  const setWeekdays = useCallback(() => {
    const keys: string[] = []
    for (let d = 0; d < 5; d++) {
      for (let h = 0; h < 24; h++) {
        keys.push(slotKey(d, h))
      }
    }
    onChange(keys)
  }, [onChange, slotKey])

  const setWeekend = useCallback(() => {
    const keys: string[] = []
    for (let d = 5; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        keys.push(slotKey(d, h))
      }
    }
    onChange(keys)
  }, [onChange, slotKey])

  const clearAll = useCallback(() => {
    onChange([])
  }, [onChange])

  const summary = formatTimeSummary(value)

  return (
    <>
      {/* 内联摘要视图 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex-1 min-w-0 text-xs text-[#4E5969] bg-[#F7F8FA] rounded px-2.5 py-1.5 truncate">
          {summary}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 h-7 text-xs"
          onClick={() => setOpen(true)}
        >
          配置
        </Button>
      </div>

      {/* 子弹窗：完整时段选择器 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[680px] p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b border-[#E5E6EB]">
            <DialogTitle className="text-sm font-medium">时段规则配置</DialogTitle>
          </DialogHeader>

          <div
            className="p-4 select-none overflow-auto max-h-[500px]"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            ref={gridRef}
          >
            {/* 顶部操作栏 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-[#4E5969] hover:text-[#FF4D88] hover:bg-[#FFF5F8]"
                  onClick={setAll}
                >
                  全周
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-[#4E5969] hover:text-[#FF4D88] hover:bg-[#FFF5F8]"
                  onClick={setWeekdays}
                >
                  周一到周五
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-[#4E5969] hover:text-[#FF4D88] hover:bg-[#FFF5F8]"
                  onClick={setWeekend}
                >
                  周末
                </Button>
                <div className="w-px h-4 bg-[#E5E6EB] mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-[#4E5969] hover:text-[#FF4D88] hover:bg-[#FFF5F8]"
                  onClick={clearAll}
                >
                  清空
                </Button>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#86909C]">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#4B8BFF]" />
                  <span>投放时间</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm border border-[#E5E6EB] bg-white" />
                  <span>不投放时间</span>
                </div>
              </div>
            </div>

            {/* 小时刻度标题 - 00:00-12:00 */}
            <div className="flex border border-[#E5E6EB] border-b-0 rounded-t-lg overflow-hidden">
              <div className="w-10 shrink-0 border-r border-[#E5E6EB] bg-[#FAFBFC]" />
              <div className="flex-1">
                <div className="text-[10px] text-[#86909C] text-center leading-5 bg-[#FAFBFC] border-b border-[#E5E6EB]">
                  00:00 - 12:00
                </div>
                <div className="flex">
                  {HOURS.slice(0, 12).map((h) => (
                    <div
                      key={h}
                      className="flex-1 text-[10px] text-[#86909C] text-center leading-5 border-r border-[#E5E6EB] last:border-r-0 bg-white"
                    >
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 小时刻度标题 - 12:00-24:00 */}
            <div className="flex border border-[#E5E6EB] border-b-0 overflow-hidden">
              <div className="w-10 shrink-0 border-r border-[#E5E6EB] bg-[#FAFBFC]" />
              <div className="flex-1">
                <div className="text-[10px] text-[#86909C] text-center leading-5 bg-[#FAFBFC] border-b border-[#E5E6EB]">
                  12:00 - 24:00
                </div>
                <div className="flex">
                  {HOURS.slice(12, 24).map((h) => (
                    <div
                      key={h}
                      className="flex-1 text-[10px] text-[#86909C] text-center leading-5 border-r border-[#E5E6EB] last:border-r-0 bg-white"
                    >
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 网格主体 */}
            <div className="border border-[#E5E6EB] rounded-b-lg overflow-hidden">
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex border-b border-[#E5E6EB] last:border-b-0">
                  <div className="w-10 shrink-0 flex items-center justify-center text-xs text-[#4E5969] border-r border-[#E5E6EB] bg-[#FAFBFC]">
                    {day}
                  </div>
                  <div className="flex flex-1">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className={`flex-1 aspect-[1.2] border-r border-[#E5E6EB] last:border-r-0 cursor-pointer transition-colors duration-75 ${
                          isActive(dayIndex, hour)
                            ? 'bg-[#4B8BFF]'
                            : 'bg-white hover:bg-[#F0F5FF]'
                        }`}
                        onMouseDown={(e) => handleMouseDown(dayIndex, hour, e)}
                        onMouseEnter={() => handleMouseEnter(dayIndex, hour)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 底部提示 */}
            <div className="text-[11px] text-[#86909C] text-center pt-2">
              可拖动鼠标选择时间段
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}