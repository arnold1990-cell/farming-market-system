const MAX_FILES_PER_GROUP = 5;
const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_DIMENSION = 1600;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read image: ${file.name}`));
    };
    image.src = url;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not compress image.'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });

export const IMAGE_UPLOAD_RULES = {
  maxFilesPerGroup: MAX_FILES_PER_GROUP,
  maxFileSizeMb: MAX_FILE_SIZE_MB
};

export const validateRawImageFile = (file) => {
  if (!ACCEPTED_IMAGE_TYPES.has(String(file?.type || '').toLowerCase())) {
    throw new Error(`Unsupported image type for ${file?.name || 'file'}. Use JPG, PNG, or WEBP.`);
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error(`${file.name} is too large to process. Choose an image smaller than 20 MB.`);
  }
};

export async function prepareImageFile(file) {
  validateRawImageFile(file);
  if (file.size <= MAX_FILE_SIZE_BYTES) return file;

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image compression is not supported in this browser.');
  }
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const outputType = file.type === 'image/png' ? 'image/jpeg' : file.type;
  let quality = 0.86;
  let compressedBlob = await canvasToBlob(canvas, outputType, quality);

  while (compressedBlob.size > MAX_FILE_SIZE_BYTES && quality > 0.5) {
    quality -= 0.08;
    compressedBlob = await canvasToBlob(canvas, outputType, quality);
  }

  if (compressedBlob.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`${file.name} is still larger than ${MAX_FILE_SIZE_MB} MB after compression. Please choose a smaller image.`);
  }

  const extension = outputType === 'image/jpeg' ? 'jpg' : outputType.split('/')[1];
  const nextName = file.name.replace(/\.[^.]+$/, '') || 'product-image';
  return new File([compressedBlob], `${nextName}.${extension}`, {
    type: outputType,
    lastModified: Date.now()
  });
}

export async function prepareImageSelection(currentFiles, selectedFiles) {
  if ((currentFiles.length + selectedFiles.length) > MAX_FILES_PER_GROUP) {
    throw new Error(`You can upload up to ${MAX_FILES_PER_GROUP} images in this section.`);
  }
  return Promise.all(selectedFiles.map((file) => prepareImageFile(file)));
}
