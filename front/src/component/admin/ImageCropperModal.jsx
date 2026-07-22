import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';

export default function ImageCropperModal({ imageSrc, onCropComplete, onCancel, aspect = 1 }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        try {
            const croppedImageFile = await getCroppedImg(
                imageSrc,
                croppedAreaPixels
            );
            onCropComplete(croppedImageFile);
        } catch (e) {
            console.error(e);
            alert('ไม่สามารถครอปรูปได้ โปรดลองอีกครั้ง');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                height: '400px',
                backgroundColor: '#333',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onCropComplete={handleCropComplete}
                    onZoomChange={onZoomChange}
                />
            </div>
            
            <div style={{ marginTop: '20px', width: '100%', maxWidth: '600px' }}>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                        setZoom(e.target.value)
                    }}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '16px' }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: '1px solid #fff',
                        background: 'transparent',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    ยกเลิก
                </button>
                <button
                    onClick={handleConfirm}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#846F5B',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    ยืนยันการครอปรูป
                </button>
            </div>
        </div>
    );
}
