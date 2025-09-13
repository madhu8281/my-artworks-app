import { useEffect, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'

type Artwork = {
  id: number
  title: string
  place_of_origin: string
  artist_display: string
  inscriptions: string
  date_start: number
  date_end: number
}

export default function ArtworksTable() {
  const [rows, setRows] = useState<Artwork[]>([])
  const [chosenIds, setChosenIds] = useState<Set<number>>(new Set())
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [selectCount, setSelectCount] = useState<string>("")
  const [targetCount, setTargetCount] = useState<number | null>(null)
  const rowsPerPage = 10
  const op = useRef<OverlayPanel>(null)

  // Fetch artworks data (server-side pagination)
  useEffect(() => {
    setLoading(true)
    fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`)
      .then((res) => res.json())
      .then((res) => {
        const mapped: Artwork[] = res.data.map((d: any) => ({
          id: d.id,
          title: d.title,
          place_of_origin: d.place_of_origin,
          artist_display: d.artist_display,
          inscriptions: d.inscriptions,
          date_start: d.date_start,
          date_end: d.date_end
        }))
        setRows(mapped)
        setTotal(res.pagination?.total ?? 100)
      })
      .finally(() => setLoading(false))
  }, [page])

  const currentSelection = rows.filter((r) => chosenIds.has(r.id))

  // Handle manual selection/deselection
  const handleSelect = (e: { value: Artwork[] }) => {
    const newSelection = new Set<number>(e.value.map((r) => r.id))
    const newIds = new Set<number>(chosenIds)

    for (let id of chosenIds) {
      if (!newSelection.has(id)) {
        newIds.delete(id)
        setExcludedIds((prev) => new Set(prev).add(id))
      }
    }

    for (let id of newSelection) {
      newIds.add(id)
    }

    setChosenIds(newIds)

    if (targetCount && newIds.size < targetCount) {
      fetchNextAvailable(newIds)
    }
  }

  const handlePage = (e: { first: number; rows: number }) => {
    setPage(Math.floor(e.first / e.rows) + 1)
  }

  const applySelection = async () => {
    const count = parseInt(selectCount, 10)
    if (!isNaN(count) && count > 0) {
      setTargetCount(count)
      setExcludedIds(new Set())

      const newIds = new Set<number>()
      let collected = 0
      let pageNum = 1

      while (collected < count) {
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${pageNum}&limit=${rowsPerPage}`
        )
        const json = await res.json()
        const mapped: Artwork[] = json.data.map((d: any) => ({
          id: d.id,
          title: d.title,
          place_of_origin: d.place_of_origin,
          artist_display: d.artist_display,
          inscriptions: d.inscriptions,
          date_start: d.date_start,
          date_end: d.date_end
        }))

        for (let r of mapped) {
          if (collected >= count) break
          if (!newIds.has(r.id)) {
            newIds.add(r.id)
            collected++
          }
        }
        pageNum++
      }

      setChosenIds(newIds)
    }

    op.current?.hide()
    setSelectCount("")
  }

  const fetchNextAvailable = async (newIds: Set<number>) => {
    let pageNum = 1
    while (true) {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNum}&limit=${rowsPerPage}`
      )
      const json = await res.json()
      const mapped: Artwork[] = json.data.map((d: any) => ({
        id: d.id,
        title: d.title,
        place_of_origin: d.place_of_origin,
        artist_display: d.artist_display,
        inscriptions: d.inscriptions,
        date_start: d.date_start,
        date_end: d.date_end
      }))

      for (let r of mapped) {
        if (!newIds.has(r.id) && !excludedIds.has(r.id)) {
          newIds.add(r.id)
          setChosenIds(new Set(newIds))
          return
        }
      }
      pageNum++
    }
  }

  return (
    <div className="card">
      <DataTable
        value={rows}
        lazy
        paginator
        rows={rowsPerPage}
        totalRecords={total}
        onPage={handlePage}
        first={(page - 1) * rowsPerPage}
        loading={loading}
        selectionMode="checkbox"
        selection={currentSelection}
        onSelectionChange={handleSelect}
        dataKey="id"
      >
        {/* First column: only checkbox */}
        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }} />

        {/* Second column: chevron */}
        {/* <Column
          header={() => (
            <div className="flex align-items-center gap-2">
              <Button
                type="button"
                icon="pi pi-chevron-down"
                className="p-button-text p-button-sm"
                onClick={(e) => op.current?.toggle(e)}
              />
              <OverlayPanel ref={op}>
                <div className="flex flex-column gap-2 p-2" style={{ width: '200px', height: '100px' }}>
                  <input
                    type="number"
                    value={selectCount}
                    onChange={(e) => setSelectCount(e.target.value)}
                    placeholder="Select rows..."
                  />
                  <Button
                    label="Submit"
                    size="small"
                    onClick={applySelection}
                    className="p-button-outlined w-full"
                  />
                </div>
              </OverlayPanel>
            </div>
          )}
          headerStyle={{ width: '4rem' }}
        /> */}
        <Column
  header={() => (
    <div className="flex align-items-center justify-content-center gap-1" style={{ width: '100%' }}>
      <Button
        type="button"
        icon="pi pi-chevron-down"
        className="p-button-text p-button-sm"
        style={{ padding: '0.25rem', minWidth: '1.5rem' }}
        onClick={(e) => op.current?.toggle(e)}
      />
      <OverlayPanel ref={op}>
        <div className="flex flex-column gap-2 p-3" style={{ width: '220px' }}>
          <input
            type="number"
            value={selectCount}
            onChange={(e) => setSelectCount(e.target.value)}
            placeholder="Select rows..."
            style={{
              width: '100%',
              padding: '1rem 0.5rem',
              borderRadius: '8px',
              border: '1px solid #ced4da'
            }}
          />
          <Button
            label="Submit"
            size="small"
            onClick={applySelection}
            className="p-button-outlined w-full"
            style={
              {
              borderRadius: '8px',
              border: '1px solid #ced4da',
              color: 'black'
            }}
          />
        </div>
      </OverlayPanel>
    </div>
  )}
  headerStyle={{ width: '4rem', textAlign: 'center' }}
/>


        {/* Other columns */}
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
    </div>
  )
}
