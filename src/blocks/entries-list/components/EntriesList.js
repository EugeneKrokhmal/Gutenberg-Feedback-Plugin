import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const EntriesList = () => {
    const [entries, setEntries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [error, setError] = useState(null);

    const fetchEntries = async (page = 1) => {
        setError(null);
        try {
            const response = await fetch(feedbackEntriesData.ajaxUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    action: 'fetch_feedback_entries',
                    page,
                    _wpnonce: feedbackEntriesData.nonce,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setEntries(data.data.entries);
                setTotalPages(data.data.totalPages);
                setCurrentPage(page);
            } else {
                setError(data.message || __('Failed to load entries.', 'feedback-plugin'));
            }
        } catch (err) {
            setError(__('An error occurred while fetching entries.', 'feedback-plugin'));
            console.error(err);
        }
    };

    const fetchEntryDetails = async (id) => {
        setError(null);
        try {
            const response = await fetch(feedbackEntriesData.ajaxUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    action: 'fetch_feedback_entry_details',
                    entry_id: id,
                    _wpnonce: feedbackEntriesData.nonce,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSelectedEntry(data.data.entry);
            } else {
                setError(data.message || __('Failed to load entry details.', 'feedback-plugin'));
            }
        } catch (err) {
            setError(__('An error occurred while fetching entry details.', 'feedback-plugin'));
            console.error(err);
        }
    };

    const renderEntries = () => {
        if (!entries.length) {
            return <p>{__('No entries found.', 'feedback-plugin')}</p>;
        }

        return (
            <ul className="entries-list">
                {entries.map(({ id, first_name, last_name, email, subject }) => (
                    <li key={id}>
                        <a
                            className="entry-detail-link"
                            onClick={() => fetchEntryDetails(id)}
                            aria-label={__('View details for entry', 'feedback-plugin') + ` ${id}`}
                        >
                            {first_name} {last_name} ({email}) - {subject}
                        </a>
                    </li>
                ))}
            </ul>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="wp-pagination">
                {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                        <button
                            key={page}
                            onClick={() => fetchEntries(page)}
                            disabled={page === currentPage}
                            className={`pagination-button wp-block-button__link wp-element-button ${
                                page === currentPage ? 'active' : ''
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderSelectedEntry = () => {
        if (!selectedEntry) return null;

        const { first_name, last_name, email, subject, message } = selectedEntry;

        return (
            <>
                <h3>{__('Entry Details', 'feedback-plugin')}</h3>
                <table className="entry-details">
                    <tbody>
                        <tr>
                            <th align="left">{__('Name:', 'feedback-plugin')}</th>
                            <td>{first_name} {last_name}</td>
                        </tr>
                        <tr>
                            <th align="left">{__('Email:', 'feedback-plugin')}</th>
                            <td>{email}</td>
                        </tr>
                        <tr>
                            <th align="left">{__('Subject:', 'feedback-plugin')}</th>
                            <td>{subject}</td>
                        </tr>
                        <tr>
                            <th align="left">{__('Message:', 'feedback-plugin')}</th>
                            <td>{message}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    };

    return (
        <div className="feedback-entries">
            <h2>{__('Feedback Entries', 'feedback-plugin')}</h2>

            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

            <button
                onClick={() => fetchEntries()}
                className="wp-block-button__link wp-element-button"
                type="button"
                aria-label={__('Load Feedback Entries', 'feedback-plugin')}
            >
                {__('Load Entries', 'feedback-plugin')}
            </button>

            {renderEntries()}
            {renderSelectedEntry()}
            {renderPagination()}
        </div>
    );
};

export default EntriesList;
