
export async function load_image(url: string): Promise<HTMLImageElement>{
    const response = await fetch(url);
    const blob = await response.blob();
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    return image;
}