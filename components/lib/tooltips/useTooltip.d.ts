import type { UseTooltipOptions, UseTooltipResult } from './types';
/**
 * Hook to position a tooltip component relative to a target component
 *
 * @param {UseTooltipOptions} [options={}] (change the default `position`, `strategy`, or `offset` of the tooltip)
 * @returns {UseTooltipResult}
 * @example
 * ```js
 * import {
 *   useTooltip,
 *   Tooltip,
 *   TOOLTIP_TOP,
 *   TOOLTIP_FIXED
 * } from '@opentrons/components'
 *
 * export function HelloWorld() {
 *   const [targetProps, tooltipProps] = useTooltip({
 *     position: TOOLTIP_TOP,
 *     strategy: TOOLTIP_FIXED
 *   })
 *
 *   return (
 *     <>
 *       <span {...targetProps}>Hello</span>
 *       <Tooltip visible={true} {...tooltipProps}>World</Tooltip>
 *     </>
 *   )
 * }
 * ```
 */
export declare function useTooltip(options?: UseTooltipOptions): UseTooltipResult;
