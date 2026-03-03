const saveBtn = document.getElementById('save');
const searchInput = document.getElementById('search');

// Display function that handles searching
function displayDocs(filter = "") {
    chrome.storage.local.get(['docs', 'isPro'], (data) => {
        const docs = data.docs || [];
        const isPro = data.isPro || false;
        const list = document.getElementById('list');
        list.innerHTML = "";

        const filtered = docs.filter(d => 
            d.title.toLowerCase().includes(filter.toLowerCase()) || 
            d.category.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(d => {
            let item = document.createElement('div');
            item.className = "item";
            item.innerHTML = `
                <span class="tag">${d.category}</span> <b>${d.title}</b><br>
                <a href="${d.content}" target="_blank" download="${d.title}">📥 Open/Download</a>
            `;
            list.appendChild(item);
        });

        if (!isPro && docs.length >= 5) {
            saveBtn.disabled = true;
            document.getElementById('lock').style.display = 'block';
            saveBtn.innerText = "LOCKED 🔒";
        }
    });
}

// Logic to Save Links or Files
saveBtn.onclick = () => {
    const title = document.getElementById('docTitle').value;
    const category = document.getElementById('docCategory').value;
    const link = document.getElementById('docLink').value;
    const fileInput = document.getElementById('fileInput').files[0];

    if (!title) return alert("Please give the document a name!");

    const saveToStorage = (contentData) => {
        chrome.storage.local.get(['docs'], (data) => {
            let docs = data.docs || [];
            docs.push({ title, category, content: contentData });
            chrome.storage.local.set({ docs }, () => {
                displayDocs();
                // Clear inputs
                document.getElementById('docTitle').value = "";
                document.getElementById('docLink').value = "";
                document.getElementById('fileInput').value = "";
            });
        });
    };

    if (fileInput) {
        // Convert File to DataURL
        const reader = new FileReader();
        reader.onload = (e) => saveToStorage(e.target.result);
        reader.readAsDataURL(fileInput);
    } else if (link) {
        saveToStorage(link);
    } else {
        alert("Please paste a link OR select a file!");
    }
};

// Listen for search typing
searchInput.addEventListener('input', () => displayDocs(searchInput.value));

// Initial Load
displayDocs();
