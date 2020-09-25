import React from 'react';
import ReactDOM from 'react-dom';
import EventsStore = require('./stores/EventsStore');
import Popup from './components/Popup';
import TestSuiteStore = require('./stores/TestSuiteStore');
import TemplatesStore = require('./stores/TemplatesStore');
import { Template } from './utils/FdEvents';
import HeadersStore = require('./stores/HeadersStore');
import '@fdmg/design-system/components/design-tokens/design-tokens.css';
import '@fdmg/design-system/components/button/Button.css';
import '@fdmg/design-system/components/button/ButtonCta.css';
import '@fdmg/design-system/components/button/ButtonGhost.css';
import '@fdmg/design-system/components/input/Checkbox.css';
import '@fdmg/design-system/components/input/TextInput.css';
import '@fdmg/design-system/components/input/TextArea.css';
import '@fdmg/design-system/components/input/Radio.css';
import './popup.scss';
import { ReSubstitute } from './utils/ReSubstitute';

declare let chrome: any;
declare let browser: any;

const browserAction =
    typeof browser !== 'undefined'
        ? browser.browserAction
        : chrome.browserAction;
const storage =
    typeof browser !== 'undefined' ? browser.storage : chrome.storage;

const storageName = 'fd-cypress-chrome-extension-events';
const storageTestSuiteName = 'fd-cypress-chrome-extension-testSuite';
const storageTestDescriptionName =
    'fd-cypress-chrome-extension-testDescription';
const storageRecord = 'fd-cypress-chrome-extension-record';
const storageTemplates = 'fd-cypress-chrome-extension-templates';
const storageBasicAuth = 'fd-cypress-chrome-extension-basic-auth';
const storageHeaders = 'fd-cypress-chrome-extension-headers';

/**
 * Persist the new test-suite name to browser storage.
 * @param testSuiteName
 */
function handleTestSuiteChange(testSuiteName: string | null) {
    storage.local.set({
        'fd-cypress-chrome-extension-testSuite': testSuiteName,
    });
}

/**
 * Persist the new test description to browser storage.
 * @param testDescription
 */
function handleTestDescriptionChange(testDescription: string | null) {
    storage.local.set({
        'fd-cypress-chrome-extension-testDescription': testDescription,
    });
}

function handleRemoveEvent(index: number) {
    if (
        confirm(
            'Do you really want to delete this event? This can not be undone.'
        )
    ) {
        EventsStore.addFuture([...EventsStore.getEvents()]);
        const events = [...EventsStore.getEvents()];
        events.splice(index, 1);
        storage.local.set({
            'fd-cypress-chrome-extension-events': events,
        });
    }
}

/**
 * Undo the last step.
 */
function undo() {
    EventsStore.addFuture([...EventsStore.getEvents()]);
    EventsStore.stepBack();
    storage.local.set({
        'fd-cypress-chrome-extension-events': EventsStore.getEvents(),
    });
}

/**
 * Redo undone step provided no other action has been recorded since the undo.
 */
function redo() {
    storage.local.set({
        'fd-cypress-chrome-extension-events': EventsStore.popFuture(),
    });
}

/**
 * Purge the browser storage from the recorded events, test suite name and test description.
 */
function clear() {
    storage.local.remove([
        storageName,
        storageTestSuiteName,
        storageTestDescriptionName,
        storageHeaders,
    ]);
    EventsStore.clear();
    HeadersStore.clear();
    TestSuiteStore.clear();
}

/**
 * Persist the current events, test suite name and test description as a new template.
 */
function saveTemplate() {
    const events = EventsStore.getEvents();
    const templates = TemplatesStore.getTemplates() || [];
    const testSuiteName = TestSuiteStore.getTestSuite();
    const testDescription = TestSuiteStore.getTestDescription();
    if (templates.length && testSuiteName) {
        const foundTemplate = templates.filter(
            (template: Template) => template.name === testSuiteName
        );
        if (foundTemplate.length) {
            templates.forEach((template: Template) => {
                if (template.name === testSuiteName) {
                    if (
                        confirm(
                            `Template with name "${testSuiteName}" already exists. Overwrite?`
                        )
                    ) {
                        template.description = testDescription;
                        template.events = events;
                        storage.local.set({
                            'fd-cypress-chrome-extension-templates': templates,
                        });
                    }
                }
            });
        } else {
            storage.local.set({
                'fd-cypress-chrome-extension-templates': templates.concat({
                    name: testSuiteName,
                    description: testDescription,
                    events,
                }),
            });
            alert(`Saved ${testSuiteName}`);
        }
    } else {
        if (!testSuiteName) {
            alert('Please enter a test suite name to save your template.');
        } else {
            storage.local.set({
                'fd-cypress-chrome-extension-templates': templates.concat({
                    name: testSuiteName,
                    description: testDescription,
                    events,
                }),
            });
            alert(`Saved ${testSuiteName}`);
        }
    }
}

/**
 * Load the selected template and replace the existing events, test suite name and description by the template values.
 * @param templateName
 */
function handleLoadTemplate(templateName: string | null | undefined) {
    if (
        templateName &&
        confirm(
            `Are you sure you want to load "${templateName}" and replace your current interactions?`
        )
    ) {
        const templates = [...TemplatesStore.getTemplates()];
        storage.local.set({
            'fd-cypress-chrome-extension-testSuite':
                templates[
                    templates.findIndex(
                        (template: Template) => template.name === templateName
                    )
                ].name,
            'fd-cypress-chrome-extension-testDescription':
                templates[
                    templates.findIndex(
                        (template: Template) => template.name === templateName
                    )
                ].description,
            'fd-cypress-chrome-extension-events':
                templates[
                    templates.findIndex(
                        (template: Template) => template.name === templateName
                    )
                ].events,
        });
    }
}

/**
 * Load the selected template and append to the existing events.
 * @param templateName
 */
function handleLoadAppendTemplate(templateName: string | null | undefined) {
    if (
        templateName &&
        confirm(
            `Are you sure you want to load "${templateName}" and append the interactions to the end of your existing interactions?`
        )
    ) {
        const templates = [...TemplatesStore.getTemplates()];
        const events = [
            ...EventsStore.getEvents(),
            ...templates[
                templates.findIndex(
                    (template: Template) => template.name === templateName
                )
            ].events,
        ];
        storage.local.set({
            'fd-cypress-chrome-extension-events': events,
        });
    }
}

/**
 * Remove the selected template from the browser storage.
 * @param templateName
 */
function removeTemplate(templateName: string | null | undefined) {
    if (
        templateName &&
        confirm(`Are you sure you want to delete "${templateName}"?`)
    ) {
        const templates = [...TemplatesStore.getTemplates()];
        const idx = templates.findIndex(
            (template: Template) => template.name === templateName
        );
        if (idx > -1) {
            templates.splice(idx, 1);
            storage.local.set({
                'fd-cypress-chrome-extension-templates': templates,
            });
        }
    }
}

function handleBasicAuthChange(basicAuth: boolean) {
    storage.local.set({
        'fd-cypress-chrome-extension-basic-auth': basicAuth,
    });
}

/**
 * Persist the recording state.
 * @param recording
 */
function handleRecording(recording: boolean) {
    storage.local.set({
        'fd-cypress-chrome-extension-record': recording,
    });
}

/**
 * Add listener to browser storage change events.
 * We modify corresponding Application data stores which in turn propagates to the views that rely on the data.
 * This ultimately results in the views always correctly reflecting the current application state.
 */
storage.onChanged.addListener((changes: any, namespace: any) => {
    for (const key in changes) {
        if (changes[key]) {
            const storageChange = changes[key];
            console.log(
                'Storage key "%s" in namespace "%s" changed. ' +
                    'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue
            );
            switch (key) {
                case storageName:
                    storageChange.newValue
                        ? EventsStore.setEvents(storageChange.newValue)
                        : EventsStore.clear();
                    break;
                case storageTestSuiteName:
                    TestSuiteStore.setTestSuite(
                        storageChange.newValue ? storageChange.newValue : null
                    );
                    break;
                case storageTestDescriptionName:
                    TestSuiteStore.setTestDescription(
                        storageChange.newValue ? storageChange.newValue : null
                    );
                    break;
                case storageRecord:
                    TestSuiteStore.setRecording(!!storageChange.newValue);
                    browserAction.setIcon({
                        path: !storageChange.newValue
                            ? '48x48.png'
                            : 'record.png',
                    });
                    break;
                case storageTemplates:
                    TemplatesStore.setTemplates(storageChange.newValue);
                    break;
                case storageBasicAuth:
                    TestSuiteStore.setBasicAuth(storageChange.newValue);
                    break;
            }
        }
    }
});

/**
 * Entry point.
 */
storage.local.get(
    {
        'fd-cypress-chrome-extension-events': null,
        'fd-cypress-chrome-extension-record': false,
        'fd-cypress-chrome-extension-basic-auth': false,
        'fd-cypress-chrome-extension-testSuite': '',
        'fd-cypress-chrome-extension-testDescription': '',
        'fd-cypress-chrome-extension-templates': [],
        'fd-cypress-chrome-extension-headers': [{ property: '', value: '' }],
    },
    (items: any) => {
        const recording = items[storageRecord];
        browserAction.setIcon({
            path: recording ? 'record.png' : '48x48.png',
        });

        /**
         * Listen for changes to Headers and save them to storage.
         */
        HeadersStore.subscribe(() => {
            storage.local.set({
                'fd-cypress-chrome-extension-headers': HeadersStore.getHeaders(),
            });
        }, ReSubstitute.Key_All);

        TestSuiteStore.setRecording(recording);
        TestSuiteStore.setTestSuite(items[storageTestSuiteName]);
        TestSuiteStore.setTestDescription(items[storageTestDescriptionName]);
        TestSuiteStore.setBasicAuth(items[storageBasicAuth]);
        TemplatesStore.setTemplates(items[storageTemplates]);
        EventsStore.setEvents(items[storageName]);
        HeadersStore.setHeaders(items[storageHeaders]);
        ReactDOM.render(
            <Popup
                onBasicAuthChange={handleBasicAuthChange}
                onUndo={undo}
                onRedo={redo}
                onClear={clear}
                onRemoveEvent={handleRemoveEvent}
                onSaveTemplate={saveTemplate}
                onLoadTemplate={handleLoadTemplate}
                onLoadAppendTemplate={handleLoadAppendTemplate}
                onRecordingChange={handleRecording}
                onRemoveTemplate={removeTemplate}
                onTestSuiteChange={handleTestSuiteChange}
                onTestDescriptionChange={handleTestDescriptionChange}
            />,
            document.querySelector('#popup')
        );
    }
);
