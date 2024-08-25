document.getElementById('displayButton').addEventListener('click', () => {
    const urlInput = document.getElementById('urlInput').value;
    const numInput = document.getElementById('numInput').value || 30;
    const linksContainer = document.getElementById('links');
    linksContainer.innerHTML = ''; // コンテナをクリア

    let urls = [];
    let baseUrl = urlInput;
    let fileNamePattern = /\/(\d+)\.([a-zA-Z]+)$/;

    // ファイル名部分を1に変更し、URLの配列を生成
    for (let i = 1; i <= numInput; i++) {
        let newUrl = baseUrl.replace(fileNamePattern, `/${i}.$2`);
        urls.push(newUrl);
    }

    // リンク要素を作成して表示
    urls.forEach(url => {
        let linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        
        let link = document.createElement('a');
        link.href = url;
        link.textContent = url.substring(url.lastIndexOf('/') + 1); // ファイル名を表示
        link.target = '_blank';
        
        linkItem.appendChild(link);
        linksContainer.appendChild(linkItem);

        // リンクの読み込み確認
        let img = new Image();
        img.src = url;
        img.onload = () => link.classList.add('loaded');
        img.onerror = () => link.classList.add('error');
    });
});
