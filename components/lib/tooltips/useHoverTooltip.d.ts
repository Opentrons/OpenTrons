import type { UseHoverTooltipOptions, UseHoverTooltipResult } from './types';
/**
 * Hook to position a tooltip component relative to a target component on hover.
 * Adds a default `enterDelay` of 300 ms before the tooltip will show
 *
 * @param {UseHoverTooltipOptions} [options={}] (change default options (see `useTooltip` and `useHover`))
 * @returns {UseHoverTooltipResult}
 * @example
 * ```js
 * import { useHoverTooltip, Tooltip } from '@opentrons/components'
 *
 * export function HelloWorld() {
 *   const [targetProps, tooltipProps] = useHoverTooltip()
 *
 *   return (
 *     <>
 *       <span {...targetProps}>Hello</span>
 *       <Tooltip {...tooltipProps}>World</Tooltip>
 *     </>
 *   )
 * }
 * ```
 */
export declare function useHoverTooltip(options?: UseHoverTooltipOptions): UseHoverTooltipResult;
