import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { ALL_SCREENS, PermissionBits, PermissionMap, ScreenKey } from '@/lib/rbac.types'
import { useRolePermissions } from '@/lib/rbac.hooks'

const ACTIONS: (keyof PermissionBits)[] = ['view','create','edit','delete','export','approve']

export default function RolePermissionsPage(){
  const router = useRouter()
  const id = String(router.query.id ?? '')
  const { perms, setPerms, loading } = useRolePermissions(id)
  const [draft, setDraft] = useState<PermissionMap | null>(null)
  const dirty = useMemo(() => JSON.stringify(perms) !== JSON.stringify(draft), [perms, draft])

  useEffect(() => { setDraft(perms ?? null) }, [perms])

  function toggle(screen: ScreenKey, action: keyof PermissionBits) {
    if (!draft) return
    const next = structuredClone(draft)
    next[screen][action] = !next[screen][action]
    setDraft(next)
  }

  function setRow(screen: ScreenKey, value: boolean) {
    if (!draft) return
    const next = structuredClone(draft)
    for (const a of ACTIONS) next[screen][a] = value
    setDraft(next)
  }

  function setCol(action: keyof PermissionBits, value: boolean) {
    if (!draft) return
    const next = structuredClone(draft)
    for (const s of ALL_SCREENS) next[s.key][action] = value
    setDraft(next)
  }

  async function save() {
    if (draft) await setPerms(draft)
  }

  return (
    <div className='space-y-4'>
      <PageHeader title={Role: } subtitle='Toggle permissions for each screen' />
      <Card>
        <div className='flex items-center justify-between mb-3 gap-2'>
          <div className='text-sm text-neutral-500'>{loading ? 'Loading permissions…' : dirty ? 'Unsaved changes' : 'Up to date'}</div>
          <div className='flex gap-2'>
            <Button variant='ghost' onClick={()=>router.back()}>Back</Button>
            <Button variant='success' onClick={save} disabled={!dirty}>Save changes</Button>
          </div>
        </div>

        <div className='overflow-auto rounded-2xl border'>
          <table className='w-full text-sm'>
            <thead className='bg-neutral-50 dark:bg-neutral-900/40'>
              <tr>
                <th className='text-left p-3 w-60'>Screen</th>
                {ACTIONS.map(a => (
                  <th key={a} className='p-3 text-center capitalize'>{a}</th>
                ))}
                <th className='p-3 text-right'>Row</th>
              </tr>
            </thead>
            <tbody>
              {ALL_SCREENS.map(s => (
                <tr key={s.key} className='border-t border-neutral-100 dark:border-neutral-800'>
                  <td className='p-3 font-medium'>{s.label}</td>
                  {ACTIONS.map(a => (
                    <td key={a} className='p-3 text-center'>
                      <input
                        type='checkbox'
                        checked={Boolean(draft?.[s.key]?.[a])}
                        onChange={()=>toggle(s.key, a)}
                        className='h-4 w-4 accent-indigo-600'
                      />
                    </td>
                  ))}
                  <td className='p-3 text-right'>
                    <Button size='sm' variant='secondary' onClick={()=>setRow(s.key, true)}>All</Button>
                    <Button size='sm' variant='ghost' className='ml-2' onClick={()=>setRow(s.key, false)}>None</Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className='border-t bg-neutral-50/70 dark:bg-neutral-900/40'>
              <tr>
                <td className='p-3 font-semibold'>Column</td>
                {ACTIONS.map(a => (
                  <td key={a} className='p-3 text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <Button size='sm' variant='secondary' onClick={()=>setCol(a, true)}>All</Button>
                      <Button size='sm' variant='ghost' onClick={()=>setCol(a, false)}>None</Button>
                    </div>
                  </td>
                ))}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}