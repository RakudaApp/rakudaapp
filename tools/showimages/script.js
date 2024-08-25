document.getElementById('displayButton').addEventListener('click', function() {
    let urlInput = document.getElementById('urlInput').value.trim();
    let numInput = document.getElementById('numInput').value || 30;
    let imagesDiv = document.getElementById('images');
    
    let urlParts = urlInput.split('/');
    let filename = urlParts[urlParts.length - 1];
    let baseURL = urlParts.slice(0, -1).join('/') + '/';
    
    let numberPart = filename.match(/\d+(?=\.\w+$)/);
    if (!numberPart) {
        alert('URLに正しいファイル名が含まれていません。');
        return;
    }

    let prefix = filename.replace(numberPart[0], ''); // 数字部分を削除してベース部分を取得
    let extension = filename.split('.').pop(); // 拡張子を取得
    prefix = prefix.replace('.' + extension, ''); // 拡張子の前の部分を取得

    for (let i = 1; i <= numInput; i++) {
        let imgId = `img_${i}`;
        let existingImg = document.getElementById(imgId);

        if (!existingImg) {
            // 画像がまだ存在しない場合、新しいimg要素を作成
            let newFilename = prefix + i + '.' + extension;
            let newUrl = baseURL + newFilename;
            let img = document.createElement('img');
            img.id = imgId;
            img.src = newUrl;
            img.alt = `Image ${i}`;
            img.style.border = "3px solid red"; // 初期状態で赤い枠線

            // 画像の読み込みが成功した場合
            img.onload = function() {
                this.style.border = "3px solid green"; // 成功したら緑の枠線
            };

            // エラーハンドリングの追加
            img.onerror = function() {
                this.style.border = "3px solid red"; // エラーが発生したら赤い枠線で再読み込み
                this.src = newUrl;
            };

            imagesDiv.appendChild(img);
        } else {
            // 既に存在する画像が読み込みエラーを起こしている場合、再読み込み
            if (existingImg.naturalWidth === 0 || existingImg.naturalHeight === 0) {
                let newFilename = prefix + i + '.' + extension;
                let newUrl = baseURL + newFilename;
                existingImg.src = newUrl; // 再読み込み
                existingImg.style.border = "3px solid red"; // エラーが起きた場合は赤い枠線
            } else {
                existingImg.style.border = "3px solid green"; // 正常に読み込まれている場合は緑の枠線
            }
        }
    }
});
