'use strict';

// 画面共有設定フォーム
const settingsFrom = document.getElementById('capture');

// プレビュー
const preview = document.getElementById('preview');

// モーダル
const modal = document.getElementById('controller');
const bootstrapModalInstance = new bootstrap.Modal(modal);

// キャプチャボタンを押したとき
settingsFrom.addEventListener('submit', (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const [ width, height ] = formData.get('resolution').split('x');
  const frameRate = formData.get('frame-rate');
  const audio = formData.get('audio');

  const options = {
    audio: !!(audio),
    video: {
      // aspectRatio: { ideal: 16 / 9 },
      width: { ideal: parseInt(width) },
      height: { ideal: parseInt(height) },
      frameRate: { ideal: parseInt(frameRate) }
    }
  };

  startCapture(options);
});

// モーダルを閉じたとき
modal.addEventListener('hide.bs.modal', () => {
  stopCapture();
});

/**
 * キャプチャを開始する
 * @param {DisplayMediaStreamOptions} [options]
 * @return {Promise}
 */
async function startCapture(options = { audio: true, video: true }) {
  let stream;

  try {
    // 画面収録が許可されていない場合は NotAllowedError になる
    stream = await navigator.mediaDevices.getDisplayMedia(options);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      alert('画面収録を許可してください。');
    }

    console.error('[ERROR]', error);
    return;
  }

  const [ track ] = stream.getTracks();

  // 画面共有を停止された場合などに実行される
  track.addEventListener('ended', () => {
    bootstrapModalInstance.hide();
  });

  // キャプチャしている画面を表示する
  preview.srcObject = stream;

  // モーダルを開く
  bootstrapModalInstance.show();

  console.info('[INFO] キャプチャを開始しました。');
}

/** キャプチャを終了する */
function stopCapture() {
  const stream = preview.srcObject;

  if (stream) {
    // トラックを停止する
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }

  // プレビューをリセットする
  preview.srcObject = null;

  // フォームをリセットする
  settingsFrom.reset();

  console.info('[INFO] キャプチャを終了しました。');
}