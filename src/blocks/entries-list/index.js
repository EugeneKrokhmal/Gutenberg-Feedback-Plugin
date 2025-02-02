import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import EntriesList from './components/EntriesList';

registerBlockType('feedback/entries-list', {
    title: __('Feedback Entries List', 'feedback-plugin'),
    icon: 'list-view',
    category: 'widgets',

    edit: () => {
        return <EntriesList />;
    },

    save: () => {
        return (
            <div className="feedback-entries">
                <button className="load-entries-button wp-block-button__link wp-element-button">
                    {__('Load Entries', 'feedback-plugin')}
                </button>
                <ul className="entries-list"></ul>
                <div className="entry-details"></div>
                <div className="wp-pagination"></div>
            </div>
        );
    },
});
