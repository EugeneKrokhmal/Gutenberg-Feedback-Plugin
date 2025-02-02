document.addEventListener("DOMContentLoaded", () => {
    const entriesContainer = document.querySelector(".feedback-entries");

    if (!entriesContainer) return;

    entriesContainer.addEventListener("click", handleContainerClick);

    function handleContainerClick(event) {
        const { target } = event;

        if (target.classList.contains("load-entries-button")) {
            fetchEntries();
        } else if (target.classList.contains("pagination-button")) {
            const page = parseInt(target.dataset.page, 10);
            if (!isNaN(page)) fetchEntries(page);
        } else if (target.classList.contains("entry-detail-link")) {
            const entryId = parseInt(target.dataset.entryId, 10);
            if (!isNaN(entryId)) fetchEntryDetails(entryId);
        }
    }

    async function fetchEntries(page = 1) {
        try {
            const response = await fetch(feedbackEntriesData.ajaxUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action: "fetch_feedback_entries",
                    page,
                    _wpnonce: feedbackEntriesData.nonce,
                }),
            });

            const data = await response.json();

            if (data.success) {
                renderEntries(data.data.entries, data.data.totalPages, page);
            } else {
                showAlert(data.message || wp.i18n.__("Failed to load entries.", "feedback-plugin"));
            }
        } catch (error) {
            handleError(wp.i18n.__("Error fetching entries.", "feedback-plugin"), error);
        }
    }

    function renderEntries(entries, totalPages, currentPage) {
        const entriesList = entriesContainer.querySelector(".entries-list");
        const pagination = entriesContainer.querySelector(".wp-pagination");
        const detailsContainer = entriesContainer.querySelector(".entry-details");

        clearContent([entriesList, pagination, detailsContainer]);

        if (!entries.length) {
            entriesList.innerHTML = `<p>${wp.i18n.__("No entries found.", "feedback-plugin")}</p>`;
            return;
        }

        entries.forEach(({ id, first_name, last_name, email, subject }) => {
            const listItem = document.createElement("li");
            const button = createLink(
                `${first_name} ${last_name} ${email} - ${subject}`,
                "entry-detail-link",
                { entryId: id }
            );
            listItem.appendChild(button);
            entriesList.appendChild(listItem);
        });

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = createLink(
                i,
                `pagination-button wp-block-buttonwp.i18n.__link wp-element-button ${i === currentPage ? 'active' : ''}`,
                { page: i },
                i === currentPage
            );
            pagination.appendChild(pageButton);
        }
    }

    async function fetchEntryDetails(entryId) {
        try {
            const response = await fetch(feedbackEntriesData.ajaxUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action: "fetch_feedback_entry_details",
                    entry_id: entryId,
                    _wpnonce: feedbackEntriesData.nonce,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const detailsContainer = entriesContainer.querySelector(".entry-details");
                const { first_name, last_name, email, message, subject } = data.data.entry;

                detailsContainer.innerHTML = `
                <h3>${wp.i18n.__("Entry Details", "feedback-plugin")}</h3>
                <table class="entry-details">
                    <tbody>
                        <tr>
                            <th align="left">${wp.i18n.__("Name:", "feedback-plugin")}</th>
                            <td>${first_name} ${last_name}</td>
                        </tr>
                        <tr>
                            <th align="left">${wp.i18n.__("Email:", "feedback-plugin")}</th>
                            <td>${email}</td>
                        </tr>
                        <tr>
                            <th align="left">${wp.i18n.__("Subject:", "feedback-plugin")}</th>
                            <td>${subject}</td>
                        </tr>
                        <tr>
                            <th align="left">${wp.i18n.__("Message:", "feedback-plugin")}</th>
                            <td>${message}</td>
                        </tr>
                    </tbody>
                </table>
            `;
            } else {
                showAlert(data.message || wp.i18n.__("Failed to load entry details.", "feedback-plugin"));
            }
        } catch (error) {
            handleError(wp.i18n.__("Error fetching entry details.", "feedback-plugin"), error);
        }
    }

    function createLink(text, className, dataAttributes = {}, isDisabled = false) {
        const link = document.createElement("a");
        link.textContent = text;
        link.className = className;
        if (isDisabled) {
            link.setAttribute("aria-disabled", "true");
        }

        Object.entries(dataAttributes).forEach(([key, value]) => {
            link.dataset[key] = value;
        });

        return link;
    }

    function clearContent(elements) {
        elements.forEach((element) => {
            if (element) element.innerHTML = "";
        });
    }

    function showAlert(message) {
        alert(message);
    }

    function handleError(message, error) {
        console.error(message, error);
        showAlert(message);
    }
});
