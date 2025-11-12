import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Sube una imagen en formato Base64 a Cloudinary
   * @param base64Image - Imagen en formato base64 (data:image/png;base64,...)
   * @param folder - Carpeta en Cloudinary (default: 'productos')
   * @returns URL pública de la imagen
   */
  async uploadImage(
    base64Image: string,
    folder = 'productos',
  ): Promise<string> {
    try {
      // Validar que sea una imagen base64 válida
      if (!base64Image || !base64Image.startsWith('data:image')) {
        throw new BadRequestException('Formato de imagen inválido');
      }

      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' }, // Redimensionar si es muy grande
          { quality: 'auto' }, // Optimización automática
          { fetch_format: 'auto' }, // Formato automático (WebP si es compatible)
        ],
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error al subir imagen a Cloudinary:', error);
      throw new BadRequestException('Error al procesar la imagen');
    }
  }

  /**
   * Elimina una imagen de Cloudinary
   * @param imageUrl - URL completa de la imagen en Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
        return; // No es una imagen de Cloudinary, ignorar
      }

      const publicId = this.extractPublicId(imageUrl);
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error al eliminar imagen de Cloudinary:', error);
      // No lanzar error, solo registrar
    }
  }

  /**
   * Extrae el public_id de una URL de Cloudinary
   * Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234567890/productos/abc123.jpg
   * Retorna: productos/abc123
   */
  private extractPublicId(url: string): string {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) {
      throw new Error('URL de Cloudinary inválida');
    }

    // Obtener todo después de /upload/v123456/
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join('/');

    // Remover extensión
    return fullPath.replace(/\.[^/.]+$/, '');
  }

  /**
   * Actualiza una imagen: elimina la anterior y sube la nueva
   */
  async updateImage(
    oldImageUrl: string | null,
    newBase64Image: string,
    folder = 'productos',
  ): Promise<string> {
    // Eliminar imagen anterior si existe
    if (oldImageUrl) {
      await this.deleteImage(oldImageUrl);
    }

    // Subir nueva imagen
    return this.uploadImage(newBase64Image, folder);
  }
}
