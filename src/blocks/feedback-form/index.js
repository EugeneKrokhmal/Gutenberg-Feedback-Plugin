import { registerBlockType } from '@wordpress/blocks';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import FormEdit from './components/FormEdit';

registerBlockType('feedback/form', {
    title: __('Feedback Form', 'feedback-plugin'),
    icon: 'feedback',
    category: 'widgets',

    attributes: {
        labelFirstName: { type: 'string', default: __('First Name', 'feedback-plugin') },
        labelLastName: { type: 'string', default: __('Last Name', 'feedback-plugin') },
        labelEmail: { type: 'string', default: __('Email', 'feedback-plugin') },
        labelSubject: { type: 'string', default: __('Subject', 'feedback-plugin') },
        labelMessage: { type: 'string', default: __('Message', 'feedback-plugin') },
        isFirstNameRequired: { type: 'boolean', default: true },
        isLastNameRequired: { type: 'boolean', default: true },
        isEmailRequired: { type: 'boolean', default: true },
        isSubjectRequired: { type: 'boolean', default: true },
        isMessageRequired: { type: 'boolean', default: true },
    },

    edit: ({ attributes, setAttributes }) => {
        return (
            <div>
                <InspectorControls>
                    <PanelBody title={__('Form Settings', 'feedback-plugin')}>
                        <TextControl
                            label={__('First Name Label', 'feedback-plugin')}
                            value={attributes.labelFirstName}
                            onChange={(value) => setAttributes({ labelFirstName: value })}
                        />
                        <ToggleControl
                            label={__('First Name Required', 'feedback-plugin')}
                            checked={attributes.isFirstNameRequired}
                            onChange={(value) => setAttributes({ isFirstNameRequired: value })}
                        />

                        <TextControl
                            label={__('Last Name Label', 'feedback-plugin')}
                            value={attributes.labelLastName}
                            onChange={(value) => setAttributes({ labelLastName: value })}
                        />
                        <ToggleControl
                            label={__('Last Name Required', 'feedback-plugin')}
                            checked={attributes.isLastNameRequired}
                            onChange={(value) => setAttributes({ isLastNameRequired: value })}
                        />

                        <TextControl
                            label={__('Email Label', 'feedback-plugin')}
                            value={attributes.labelEmail}
                            onChange={(value) => setAttributes({ labelEmail: value })}
                        />
                        <ToggleControl
                            label={__('Email Required', 'feedback-plugin')}
                            checked={attributes.isEmailRequired}
                            onChange={(value) => setAttributes({ isEmailRequired: value })}
                        />
                        <TextControl
                            label={__('Subject Label', 'feedback-plugin')}
                            value={attributes.labelSubject}
                            onChange={(value) => setAttributes({ labelSubject: value })}
                        />
                        <ToggleControl
                            label={__('Subject Required', 'feedback-plugin')}
                            checked={attributes.isSubjectRequired}
                            onChange={(value) => setAttributes({ isSubjectRequired: value })}
                        />
                        <TextControl
                            label={__('Message Label', 'feedback-plugin')}
                            value={attributes.labelMessage}
                            onChange={(value) => setAttributes({ labelMessage: value })}
                        />
                        <ToggleControl
                            label={__('Message Required', 'feedback-plugin')}
                            checked={attributes.isMessageRequired}
                            onChange={(value) => setAttributes({ isMessageRequired: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                <FormEdit attributes={attributes} />
            </div>
        );
    },

    save: ({ attributes }) => {
        return (
            <div
                className="feedback-form-container"
                data-attributes={JSON.stringify(attributes)}
            >
                <p>{__('Loading feedback form...', 'feedback-plugin')}</p>
            </div>
        );
    }
});
