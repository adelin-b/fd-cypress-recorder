import React, { PureComponent } from 'react';
import EventsStore = require('../stores/EventsStore');
import ContextULCheckAttribute from './ContextULCheckAttribute';
import ContextULCheckCount from './ContextULCheckCount';
import { AllFdEvents, FdEventType } from '../utils/FdEvents';
import styles from './ContextMenu.module.scss';

declare let window: Window;

export interface Props {
    target: HTMLElement;
    selector: string;
}

/**
 * This component renders the right mouse-click context menu.
 */
export default class ContextMenu extends PureComponent<Props, any> {
    state: any = {};
    private top = 0;
    private left = 0;
    private w = 0;

    constructor(props: Props) {
        super(props);
        this.top = Math.max(
            document.documentElement.scrollTop +
                this.props.target.getBoundingClientRect().top +
                this.props.target.getBoundingClientRect().height,
            0
        );
        this.left = Math.max(
            document.documentElement.scrollLeft +
                this.props.target.getBoundingClientRect().left +
                this.props.target.getBoundingClientRect().width,
            0
        );
        this.w = Math.max(
            document.documentElement.clientWidth,
            window.innerWidth || 0
        );
        if (this.left + 250 > this.w) {
            this.left = Math.max(
                document.documentElement.scrollLeft +
                    this.props.target.getBoundingClientRect().left -
                    200,
                0
            );
        }
    }

    handleClick = () => {
        EventsStore.addEvent({
            type: FdEventType.CLICK,
            target: this.props.selector,
        });
        this.props.target.click();
    };

    handleCheckExists = () => {
        EventsStore.addEvent({
            type: FdEventType.EXISTS,
            target: this.props.selector,
        });
    };

    handleCheckText = () => {
        const textContent =
            prompt('Text content of selected element should contain') || '';
        if (textContent) {
            EventsStore.addEvent({
                type: FdEventType.CONTAINS_TEXT,
                target: this.props.selector,
                value: textContent,
            });
        }
    };

    handleHover = () => {
        EventsStore.addEvent({
            type: FdEventType.HOVER,
            target: this.props.selector,
        });
        this.props.target.focus();
    };

    handleVisit = () => {
        EventsStore.addEvent({
            type: FdEventType.VISIT,
            href: window.location.href,
        });
    };

    handleAwaitLocation = () => {
        EventsStore.addEvent({
            type: FdEventType.LOCATION,
            href: window.location.href,
        });
    };

    handleAwaitLocationContains = () => {
        const value = prompt('URL should contain') || '';
        if (value) {
            EventsStore.addEvent({
                type: FdEventType.LOCATION_CONTAINS,
                value,
            });
        }
    };

    handleGoToLocation = () => {
        const value = prompt('URL to visit', 'https://') || '';
        if (value) {
            EventsStore.addEvent({ type: FdEventType.VISIT, href: value });
            window.location.assign(value);
        }
    };

    handleEnterText = () => {
        this.props.target.focus();
        const value = prompt('Type your text') || '';
        if (value) {
            EventsStore.addEvent({
                type: FdEventType.TYPE,
                target: this.props.selector,
                value,
            });
        }
    };

    handleWait = () => {
        const value = prompt('Wait for n milliseconds') || '';
        if (value) {
            EventsStore.addEvent({ type: FdEventType.WAIT, value });
        }
    };

    handleSubContextMenuAssert = (event: AllFdEvents) => {
        EventsStore.addEvent(event);
    };

    /**
     * Open Check Attribute context menu
     */
    handleCheckAttribute = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        this.setState({
            customContextMenu: (
                <ContextULCheckAttribute
                    target={this.props.target}
                    selector={this.props.selector}
                    onMouseDown={this.handleSubContextMenuAssert}
                    onBack={this.handleContextMenuBack}
                />
            ),
        });
    };

    /**
     * Open Check Count context menu
     */
    handleCheckCount = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        this.setState({
            customContextMenu: (
                <ContextULCheckCount
                    target={this.props.target}
                    selector={this.props.selector}
                    onMouseDown={this.handleSubContextMenuAssert}
                    onBack={this.handleContextMenuBack}
                />
            ),
        });
    };

    handleContextMenuBack = () => {
        this.setState({ customContextMenu: null });
    };

    render() {
        return (
            <div
                className={styles.contextMenu}
                style={{ top: `${this.top}px`, left: `${this.left}px` }}
            >
                {this.state.customContextMenu ? (
                    this.state.customContextMenu
                ) : (
                    <ul>
                        <li className={styles.label}>Interactions</li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleClick}
                        >
                            Click
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleEnterText}
                        >
                            Enter text...
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleHover}
                        >
                            Hover
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleWait}
                        >
                            Wait...
                        </li>
                        <li className={styles.label}>Asserts</li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleCheckAttribute}
                        >
                            Attributes...
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleCheckText}
                        >
                            Contains text...
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleCheckCount}
                        >
                            Count...
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleCheckExists}
                        >
                            Exists
                        </li>
                        <li className={styles.label}>Global</li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleGoToLocation}
                        >
                            Go to URL...
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleAwaitLocation}
                        >
                            Match current URL
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleAwaitLocationContains}
                        >
                            URL contains...
                        </li>
                        <li
                            className={styles.clickable}
                            onMouseDown={this.handleVisit}
                        >
                            Visit current URL
                        </li>
                    </ul>
                )}
                <small>{this.props.selector}</small>
            </div>
        );
    }
}
