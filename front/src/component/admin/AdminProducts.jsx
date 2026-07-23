import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminProducts.css';
import ImageCropperModal from './ImageCropperModal';
const API_URL = '/api';

export default function AdminProducts({ user }) {
    const [products, setProducts] = useState([]);
    const [customTags, setCustomTags] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'ready-made',
        tag: '',
        newTag: '',
        description: '',
        existingImage: '',
        isCustom: false,
        customOptions: []
    });
    const [imageFile, setImageFile] = useState(null);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [activeCropTarget, setActiveCropTarget] = useState(null); // 'main' or { optIndex, choiceIndex }

    const handleAddNew = () => {
        setEditingId(null);
        setIsAdding(true);
        setFormData({ name: '', price: '', category: 'ready-made', tag: '', newTag: '', description: '', existingImage: '', isCustom: false, customOptions: [] });
        setImageFile(null);
    };

    const handleEdit = (p) => {
        setIsAdding(false);
        setEditingId(p.id);
        const mappedOptions = (p.customOptions || []).map(opt => ({
            name: opt.name,
            choices: opt.choices.map(c => typeof c === 'string' ? { name: c, image: '' } : c)
        }));

        setFormData({
            name: p.name || '',
            price: p.price || '',
            category: p.category || 'ready-made',
            tag: p.tag || '',
            newTag: '',
            description: p.description || '',
            existingImage: p.image || '',
            isCustom: !!p.isCustom,
            customOptions: mappedOptions
        });
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await axios.get(`${API_URL}/products/tags/all`);
            setCustomTags(response.data);
        } catch (err) {
            console.error('Failed to fetch tags', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchTags();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // If they select an existing tag, clear newTag
            if (name === 'tag') {
                updated.newTag = '';
            }
            // If they change category, reset tag (old tags may not exist in new category)
            if (name === 'category') {
                updated.tag = '';
                updated.newTag = '';
            }
            return updated;
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result);
                setActiveCropTarget('main');
            });
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    };

    const handleCropComplete = (croppedFile) => {
        if (activeCropTarget === 'main') {
            setImageFile(croppedFile);
        } else if (activeCropTarget && activeCropTarget.optIndex !== undefined) {
            updateChoiceFile(activeCropTarget.optIndex, activeCropTarget.choiceIndex, croppedFile);
        }
        setCropImageSrc(null);
        setActiveCropTarget(null);
    };

    const handleCropCancel = () => {
        setCropImageSrc(null);
        setActiveCropTarget(null);
    };

    // Custom Options Handlers
    const handleToggleCustom = (e) => {
        setFormData(prev => ({ ...prev, isCustom: e.target.checked }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            customOptions: [...prev.customOptions, { name: '', choices: [{ name: '', image: '' }] }]
        }));
    };

    const removeOption = (index) => {
        setFormData(prev => {
            const newOpts = [...prev.customOptions];
            newOpts.splice(index, 1);
            return { ...prev, customOptions: newOpts };
        });
    };

    const updateOptionName = (index, value) => {
        setFormData(prev => {
            const newOpts = [...prev.customOptions];
            newOpts[index] = { ...newOpts[index], name: value };
            return { ...prev, customOptions: newOpts };
        });
    };

    const addChoice = (optIndex) => {
        setFormData(prev => {
            const newOpts = [...prev.customOptions];
            newOpts[optIndex] = {
                ...newOpts[optIndex],
                choices: [...newOpts[optIndex].choices, { name: '', image: '' }]
            };
            return { ...prev, customOptions: newOpts };
        });
    };

    const removeChoice = (optIndex, choiceIndex) => {
        setFormData(prev => {
            const newOpts = [...prev.customOptions];
            const newChoices = [...newOpts[optIndex].choices];
            newChoices.splice(choiceIndex, 1);
            newOpts[optIndex] = { ...newOpts[optIndex], choices: newChoices };
            return { ...prev, customOptions: newOpts };
        });
    };

    const updateChoice = (optIndex, choiceIndex, field, value) => {
        setFormData(prev => {
            const newOpts = [...prev.customOptions];
            const newChoices = [...newOpts[optIndex].choices];
            newChoices[choiceIndex] = { ...newChoices[choiceIndex], [field]: value };
            newOpts[optIndex] = { ...newOpts[optIndex], choices: newChoices };
            return { ...prev, customOptions: newOpts };
        });
    };

    const updateChoiceFile = (optIndex, choiceIndex, file) => {
        setFormData(prev => {
            const newOpts = [...prev.customOptions];
            const newChoices = [...newOpts[optIndex].choices];
            newChoices[choiceIndex] = { ...newChoices[choiceIndex], file };
            newOpts[optIndex] = { ...newOpts[optIndex], choices: newChoices };
            return { ...prev, customOptions: newOpts };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);

            let finalPrice = parseInt(formData.price, 10);
            if (isNaN(finalPrice) || finalPrice < 0) finalPrice = 0;
            data.append('price', finalPrice);
            data.append('category', formData.category);

            const finalTag = (formData.newTag && formData.newTag.trim() !== '') ? formData.newTag.trim() : formData.tag;
            data.append('tag', finalTag);

            data.append('description', formData.description);
            data.append('isCustom', formData.isCustom);
            if (formData.isCustom) {
                const optionsToSave = formData.customOptions.map((opt, optIndex) => ({
                    ...opt,
                    choices: opt.choices.map((choice, choiceIndex) => {
                        if (choice.file) {
                            data.append(`choiceImg_${optIndex}_${choiceIndex}`, choice.file);
                        }
                        const rest = { ...choice };
                        delete rest.file;
                        return rest;
                    })
                }));
                data.append('customOptions', JSON.stringify(optionsToSave));
            }

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingId) {
                await axios.put(`${API_URL}/products/${editingId}`, data, {
                    headers: {
                        'x-user-id': user.id,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                Swal.fire({ title: 'สำเร็จ', text: 'แก้ไขสินค้าเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#846F5B' });
            } else {
                await axios.post(`${API_URL}/products`, data, {
                    headers: {
                        'x-user-id': user.id,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                Swal.fire({ title: 'สำเร็จ', text: 'เพิ่มสินค้าเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#846F5B' });
            }
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', price: '', category: 'ready-made', tag: '', newTag: '', description: '', existingImage: '', isCustom: false, customOptions: [] });
            setImageFile(null);
            fetchProducts();
            fetchTags();
        } catch (err) {
            console.error('Failed to add product', err);
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: `เกิดข้อผิดพลาดในการ${editingId ? 'แก้ไข' : 'เพิ่ม'}สินค้า`, icon: 'error', confirmButtonColor: '#a35d6a' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;
        try {
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { 'x-user-id': user.id }
            });
            Swal.fire({ title: 'สำเร็จ', text: 'ลบสินค้าสำเร็จ', icon: 'success', confirmButtonColor: '#846F5B' });
            fetchProducts();
        } catch (err) {
            console.error('Failed to delete product', err);
            Swal.fire({ title: 'ผิดพลาด', text: 'เกิดข้อผิดพลาดในการลบสินค้า', icon: 'error', confirmButtonColor: '#a35d6a' });
        }
    };

    const handleDeleteTag = async () => {
        if (!formData.tag) return Swal.fire({ title: 'ข้อผิดพลาด', text: 'กรุณาเลือกแท็กที่ต้องการลบ', icon: 'warning', confirmButtonColor: '#846F5B' });
        const tagToDelete = formData.tag;
        
        const isPredefined = predefinedTags[formData.category]?.includes(tagToDelete);
        let confirmMsg = `คุณแน่ใจหรือไม่ว่าต้องการลบแท็ก "${tagToDelete}" ออกจากสินค้าทุกชิ้นในหมวดหมู่นี้ รวมออกจากระบบด้วย?`;
        if (isPredefined) {
            confirmMsg = `แท็ก "${tagToDelete}" เป็นแท็กเริ่มต้น การลบนี้จะเป็นการเคลียร์แท็กออกจากสินค้าทุกชิ้นที่ใช้อยู่ แต่ตัวเลือกอาจจะยังคงอยู่เนื่องจากเป็นค่าเริ่มต้นของระบบ ยืนยันการลบ?`;
        }

        if (!window.confirm(confirmMsg)) return;

        try {
            const productsWithTag = products.filter(p => p.category === formData.category && p.tag === tagToDelete);
            
            for (const p of productsWithTag) {
                const data = new FormData();
                data.append('name', p.name);
                data.append('price', p.price);
                data.append('category', p.category);
                data.append('tag', ''); 
                data.append('description', p.description || '');
                data.append('isCustom', !!p.isCustom);
                if (p.isCustom && p.customOptions) {
                    data.append('customOptions', JSON.stringify(p.customOptions));
                }
                
                await axios.put(`${API_URL}/products/${p.id}`, data, {
                    headers: {
                        'x-user-id': user.id,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            
            // Delete from tags.json in backend
            if (!isPredefined) {
                await axios.delete(`${API_URL}/products/tags/${encodeURIComponent(tagToDelete)}?category=${formData.category}`, {
                    headers: { 'x-user-id': user.id }
                });
            }
            
            Swal.fire({ title: 'สำเร็จ', text: `ลบแท็ก "${tagToDelete}" เรียบร้อยแล้ว`, icon: 'success', confirmButtonColor: '#846F5B' });
            setFormData(prev => ({ ...prev, tag: '' }));
            fetchProducts();
            fetchTags();
        } catch (err) {
            console.error('Failed to delete tag', err);
            Swal.fire({ title: 'ผิดพลาด', text: 'เกิดข้อผิดพลาดในการลบแท็ก', icon: 'error', confirmButtonColor: '#a35d6a' });
        }
    };

    const predefinedTags = {
        'ready-made': ['จัดส่งฟรี', 'แนะนำ Custom'],
        'custom': ['จัดส่งฟรี', 'แนะนำ Custom'],
        'gift': ['ตุ๊กตาหมี', 'เทียนหอม', 'กล่อง/การ์ด', 'การ์ด']
    };

    const existingTags = [...new Set([
        ...(predefinedTags[formData.category] || []),
        ...(customTags[formData.category] || []),
        ...products
            .filter(p => p.category === formData.category)
            .map(p => p.tag)
            .filter(tag => tag && tag.trim() !== '')
    ])];

    const existingOptionTemplates = {};
    products.forEach(p => {
        if (p.isCustom && p.customOptions) {
            p.customOptions.forEach(opt => {
                if (opt.name && !existingOptionTemplates[opt.name]) {
                    existingOptionTemplates[opt.name] = opt.choices.map(c => ({ name: c.name || (typeof c === 'string' ? c : ''), image: '' }));
                }
            });
        }
    });
    const existingOptionNames = Object.keys(existingOptionTemplates);

    const handleOptionTemplateSelect = (optIndex, selectedName) => {
        setFormData(prev => {
            const newOpts = [...prev.customOptions];
            let newChoices = newOpts[optIndex].choices;
            
            if (selectedName && existingOptionTemplates[selectedName]) {
                 newChoices = existingOptionTemplates[selectedName].map(c => ({ name: c.name, image: '' }));
            }
            
            newOpts[optIndex] = {
                ...newOpts[optIndex],
                name: selectedName,
                choices: newChoices
            };
            
            return { ...prev, customOptions: newOpts };
        });
    };

    if (isLoading) return <div>กำลังโหลดสินค้า...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>จัดการสินค้า</h1>
                {!isAdding && !editingId && (
                    <button className="btn-add-product" onClick={handleAddNew}>
                        <i className="fa-solid fa-plus"></i> เพิ่มสินค้าใหม่
                    </button>
                )}
            </div>



            {(isAdding || editingId) && (
                <div className="add-product-form">
                    <h2 style={{ marginTop: 0, color: '#1e293b' }}>{editingId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group-admin">
                                <label>ชื่อสินค้า</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group-admin">
                                <label>ราคา (บาท)</label>
                                <input type="number" name="price" required value={formData.price} onChange={handleInputChange} min={1} />
                            </div>
                            <div className="form-group-admin">
                                <label>หมวดหมู่</label>
                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                    <option value="ready-made">ดอกไม้แห้ง</option>
                                    <option value="custom">ดอกไม้ประดิษฐ์</option>
                                    <option value="gift">ของขวัญ</option>
                                </select>
                            </div>
                            <div className="form-group-admin">
                                <label>รูปภาพสินค้า</label>
                                {editingId && formData.existingImage && !imageFile && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <img src={`/uploads/${formData.existingImage}`} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2d9c9' }} />
                                        <div style={{ fontSize: '0.8rem', color: '#8a7a68', marginTop: '4px' }}>รูปภาพปัจจุบัน (หากไม่ต้องการเปลี่ยน ให้เว้นว่างไว้)</div>
                                    </div>
                                )}
                                {imageFile && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <img src={URL.createObjectURL(imageFile)} alt="Cropped preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2d9c9' }} />
                                        <div style={{ fontSize: '0.8rem', color: '#8a7a68', marginTop: '4px' }}>รูปภาพใหม่ที่จะใช้</div>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <div className="form-group-admin">
                                <label>เลือกแท็ก / หมวดย่อยที่มีอยู่แล้ว</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select name="tag" value={formData.tag} onChange={handleInputChange} style={{ flex: 1, marginBottom: 0 }}>
                                        <option value="">-- ไม่ระบุ / สร้างใหม่ด้านล่าง --</option>
                                        {existingTags.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    {formData.tag && (
                                        <button 
                                            type="button" 
                                            onClick={handleDeleteTag}
                                            style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                                            title="ลบแท็กนี้ออกจากสินค้าทั้งหมดในหมวดหมู่นี้"
                                        >
                                            <i className="fa-solid fa-trash"></i> ลบ
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="form-group-admin">
                                <label>หรือสร้างแท็กใหม่</label>
                                <input
                                    type="text"
                                    name="newTag"
                                    value={formData.newTag}
                                    onChange={handleInputChange}
                                    placeholder="พิมพ์แท็กใหม่ที่นี่..."
                                />
                            </div>
                        </div>
                        <div className="form-group-admin" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="isCustom"
                                checked={formData.isCustom}
                                onChange={handleToggleCustom}
                                style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
                            />
                            <label htmlFor="isCustom" style={{ marginBottom: 0, cursor: 'pointer' }}>สินค้านี้มีตัวเลือก (Custom) เช่น ขนาด, สีดอกไม้</label>
                        </div>

                        {formData.isCustom && (
                            <div className="custom-options-container">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>จัดการตัวเลือกสินค้า</h3>
                                    <button type="button" onClick={addOption} className="btn-add-option">
                                        <i className="fa-solid fa-plus"></i> เพิ่มตัวเลือกหลัก
                                    </button>
                                </div>

                                {formData.customOptions.length === 0 ? (
                                    <p style={{ color: '#8a7a68', fontStyle: 'italic', fontSize: '0.9rem' }}>ยังไม่มีตัวเลือก กด "เพิ่มตัวเลือกหลัก" เพื่อเริ่มต้น</p>
                                ) : (
                                    <div className="custom-options-list">
                                        {formData.customOptions.map((opt, optIndex) => (
                                            <div key={optIndex} className="custom-option-card">
                                                <div className="custom-option-header" style={{ alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <select
                                                            value={existingOptionNames.includes(opt.name) ? opt.name : ''}
                                                            onChange={(e) => handleOptionTemplateSelect(optIndex, e.target.value)}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2d9c9', marginBottom: '8px', fontFamily: 'inherit', color: '#665342' }}
                                                        >
                                                            <option value="">-- เลือกตัวเลือกที่มีอยู่แล้ว --</option>
                                                            {existingOptionNames.map(name => (
                                                                <option key={name} value={name}>{name}</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            placeholder="หรือสร้างชื่อตัวเลือกใหม่ เช่น 'ขนาด', 'รูปแบบดอก'"
                                                            value={opt.name}
                                                            onChange={(e) => updateOptionName(optIndex, e.target.value)}
                                                            required
                                                            className="option-name-input"
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => removeOption(optIndex)} className="btn-remove-option" title="ลบตัวเลือกนี้">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                                <div className="custom-choices-list">
                                                    {opt.choices.map((choice, choiceIndex) => (
                                                        <div key={choiceIndex} className="custom-choice-item" style={{ flexDirection: 'column', alignItems: 'flex-start', background: '#f8f9fa', padding: '10px', borderRadius: '8px', border: '1px solid #e2d9c9', position: 'relative' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeChoice(optIndex, choiceIndex)}
                                                                className="btn-remove-choice"
                                                                disabled={opt.choices.length <= 1}
                                                                title={opt.choices.length <= 1 ? "ต้องมีอย่างน้อย 1 รายการ" : "ลบรายการนี้"}
                                                                style={{ position: 'absolute', top: '8px', right: '8px' }}
                                                            >
                                                                <i className="fa-solid fa-xmark"></i>
                                                            </button>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', marginBottom: '8px', paddingRight: '24px' }}>
                                                                <i className="fa-solid fa-caret-right" style={{ color: '#8a7a68', fontSize: '0.8rem' }}></i>
                                                                <input
                                                                    type="text"
                                                                    placeholder={`ชื่อรายการที่ ${choiceIndex + 1} (เช่น S, กุหลาบแดง)`}
                                                                    value={choice.name || ''}
                                                                    onChange={(e) => updateChoice(optIndex, choiceIndex, 'name', e.target.value)}
                                                                    required
                                                                    className="choice-input"
                                                                />
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                                                                <i className="fa-solid fa-image" style={{ color: '#8a7a68', fontSize: '0.8rem', marginLeft: '4px' }}></i>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files && e.target.files[0]) {
                                                                            const file = e.target.files[0];
                                                                            const reader = new FileReader();
                                                                            reader.addEventListener('load', () => {
                                                                                setCropImageSrc(reader.result);
                                                                                setActiveCropTarget({ optIndex, choiceIndex });
                                                                            });
                                                                            reader.readAsDataURL(file);
                                                                            e.target.value = null;
                                                                        }
                                                                    }}
                                                                    className="choice-input"
                                                                    style={{ flex: 1, fontSize: '0.8rem' }}
                                                                />
                                                                {choice.file && (
                                                                    <img src={URL.createObjectURL(choice.file)} alt="preview" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                                                                )}
                                                                {!choice.file && choice.image && typeof choice.image === 'string' && (
                                                                    <img src={choice.image.startsWith('http') ? choice.image : `/uploads/${choice.image}`} alt="preview" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} onError={(e) => { e.target.style.display = 'none' }} onLoad={(e) => { e.target.style.display = 'block' }} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addChoice(optIndex)} className="btn-add-choice">
                                                        <i className="fa-solid fa-plus"></i> เพิ่มรายการ
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-group-admin">
                            <label>รายละเอียด (ไม่เกิน 40 ตัวอักษร)</label>
                            <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} maxLength="40"></textarea>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="button" className="btn-cancel" style={{ padding: '12px 24px', borderRadius: '30px', border: '1px solid #e2d9c9', background: '#fff', color: '#8a7a68', cursor: 'pointer', fontWeight: '600' }} onClick={() => { setIsAdding(false); setEditingId(null); }}>ยกเลิก</button>
                            <button type="submit" className="btn-save" style={{ padding: '12px 24px', borderRadius: '30px', border: 'none', cursor: 'pointer', background: 'var(--primary, #846F5B)', color: '#fff', fontWeight: '600', boxShadow: '0 4px 12px rgba(132,111,91,0.2)' }}>บันทึกสินค้า</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>รูป</th>
                                <th>ชื่อสินค้า</th>
                                <th>หมวดหมู่</th>
                                <th>ราคา</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        {p.image ? (
                                            <img src={`/uploads/${p.image}`} alt={p.name} className="product-img-preview" />
                                        ) : (
                                            <div className="product-img-preview" style={{ background: '#e2e8f0' }}></div>
                                        )}
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>฿{p.price}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-edit" onClick={() => handleEdit(p)} style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#64748b' }}>
                                                <i className="fa-solid fa-pen"></i> แก้ไข
                                            </button>
                                            <button className="btn-danger" onClick={() => handleDelete(p.id)} style={{ padding: '6px 12px', borderRadius: '4px' }}>
                                                <i className="fa-solid fa-trash"></i> ลบ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {cropImageSrc && (
                <ImageCropperModal
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspect={1}
                />
            )}
        </div>
    );
}
