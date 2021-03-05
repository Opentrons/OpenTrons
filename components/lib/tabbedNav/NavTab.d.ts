import * as React from 'react';
import type { IconName } from '../icons';
export interface NavTabProps {
    /** optional click event for nav button */
    onClick?: React.MouseEventHandler;
    /** optional url for nav button route */
    url?: string;
    /** position a single button on the bottom of the page */
    isBottom?: boolean;
    /** classes to apply */
    className?: string;
    /** id */
    id?: string;
    /** disabled attribute (setting disabled removes onClick) */
    disabled?: boolean;
    /** optional title to display below the icon */
    title?: string;
    /** Icon name for button's icon */
    iconName: IconName;
    /** Display a notification dot */
    notification?: boolean;
    /** selected styling (can also use react-router & `activeClassName`) */
    selected?: boolean;
}
export declare function NavTab(props: NavTabProps): JSX.Element;
