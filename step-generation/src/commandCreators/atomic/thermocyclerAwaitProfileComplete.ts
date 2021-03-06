import type { ModuleOnlyParams } from '@opentrons/shared-data/protocol/types/schemaV4'
import type { CommandCreator } from '../../types'
export const thermocyclerAwaitProfileComplete: CommandCreator<ModuleOnlyParams> = (
  args,
  invariantContext,
  prevRobotState
) => {
  return {
    commands: [
      {
        command: 'thermocycler/awaitProfileComplete',
        params: {
          module: args.module,
        },
      },
    ],
  }
}
