document.getElementById('displayButton').addEventListener('click', function() {
    const urlInput = document.getElementById('urlInput').value.trim();
    const numInput = parseInt(document.getElementById('numInput').value.trim(), 10) || 30;

    if (!urlInput) {
        alert('画像URLを入力してください');
        return;
    }

    const linksContainer = document.getElementById('links');
    if (!linksContainer) {
        console.error('Links container not found');
        return;
    }
    linksContainer.innerHTML = '';

    const urls = [];
    const baseUrl = urlInput.substring(0, urlInput.lastIndexOf('/') + 1);
    const fileName = urlInput.substring(urlInput.lastIndexOf('/') + 1);
    const fileNameParts = fileName.match(/(\d+)(\.[a-z]+)$/); // 数字と拡張子を分ける
    if (!fileNameParts) {
        alert('ファイル名が無効です');
        return;
    }
    const fileNamePrefix = fileNameParts[1];
    const fileNameExtension = fileNameParts[2];

    for (let i = 1; i <= numInput; i++) {
        urls.push(baseUrl + (parseInt(fileNamePrefix, 10) + i - 1) + fileNameExtension);
    }

    urls.forEach(url => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';

        const link = document.createElement('a');
        link.href = url;
        link.textContent = url.substring(url.lastIndexOf('/') + 1);
        link.target = '_blank';

        linkItem.appendChild(link);
        linksContainer.appendChild(linkItem);
    });
});
