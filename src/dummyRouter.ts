import { initTRPC } from '@trpc/server'
import { z, ZodType } from 'zod'
import { OperationMeta } from './meta'

export const createDummyRouter = (
  t = initTRPC.meta<OperationMeta>().create(),
) => {
  return t.router({
    hello: t.router({
      world: t.procedure
        .meta({ description: 'ok' })
        .input(z.object({ name: z.string() }))
        .output(z.string())
        .query(() => 'hello world'),
    }),
  })
}

type DummyRouterShape = ReturnType<typeof createDummyRouter>

// tRPC v11 doesn't expose the raw Zod `output` parser or a usefully typed
// `meta` object in its public procedure types (only `unknown`/inferred TS
// types), even though the real values are still present at runtime. Restore
// them here since this library reads them directly off `_def`.
export type DummyProcedure = Omit<
  DummyRouterShape['hello']['world']['_def'],
  'output' | 'meta'
> & {
  output?: ZodType
  meta?: Record<string, unknown>
}

// `_def.procedures` is typed as a nested router-record tree matching the
// router's object literal shape, but at runtime tRPC flattens it into a
// dot-joined map of procedures. This type mirrors that runtime shape so it
// can be used as a cast target in generate.ts.
export interface DummyRouter {
  _def: {
    procedures: Record<string, { _def: DummyProcedure }>
  }
}
