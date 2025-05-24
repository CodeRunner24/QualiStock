import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import os
import gradio as gr

# Metal (MPS) GPU desteğini kontrol et
device = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
print(f"Kullanılan cihaz: {device}")

# Modeli yükle
def load_model(model_path):
    checkpoint = torch.load(model_path, map_location=device)
    
    # Sınıf isimlerini yükle
    class_names = checkpoint['class_names']
    
    # Modeli oluştur (ResNet18)
    model = models.resnet18()
    
    # İkili sınıflandırma için son katmanı değiştir
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(num_features, 1)
    )
    
    # Model ağırlıklarını yükle
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    return model, class_names

# Görüntüyü işle ve tahmin et
def predict_image(img, model, class_names):
    # Görüntüyü işle
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # PIL Image'e dönüştür
    if isinstance(img, np.ndarray):
        img = Image.fromarray(img.astype('uint8'))
    
    image_tensor = transform(img).unsqueeze(0).to(device)
    
    # Tahmin yap
    with torch.no_grad():
        outputs = model(image_tensor)
        probability = torch.sigmoid(outputs).item() * 100  # Çürük olma olasılığı
    
    # 0.5 eşiği ile sınıf tahmini
    predicted_class = class_names[1] if probability >= 50 else class_names[0]
    confidence = probability if probability >= 50 else 100 - probability
    
    # Sonucu hazırla
    result = {
        "tahmin": predicted_class,
        "güven": confidence,
        "çürük_olasılığı": probability,
    }
    
    return result

# Sonucu görselleştir
def create_prediction_plot(img, result):
    # Görüntüyü ve tahminleri göster
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
    
    # Görüntü
    ax1.imshow(img)
    ax1.set_title(f"Tahmin: {result['tahmin']}\nGüven: {result['güven']:.2f}%")
    ax1.axis('off')
    
    # Olasılık çubuğu
    class_names = ["fresh", "rotten"]
    probs = [100 - result['çürük_olasılığı'], result['çürük_olasılığı']]
    y_pos = np.arange(len(class_names))
    
    bars = ax2.barh(y_pos, probs)
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(class_names)
    ax2.set_xlabel('Olasılık (%)')
    ax2.set_title('Sınıf Olasılıkları')
    
    # Çürük olma tahmini için kırmızı renk kullan
    bars[1].set_color('red') 
    bars[0].set_color('green')
    
    plt.tight_layout()
    
    return fig

# Model dosyasını kontrol et
model_path = 'models/best_model.pth'
if not os.path.exists(model_path):
    model_path = 'models/meyve_kalite_modeli.pth'
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model dosyası bulunamadı: {model_path}")

# Modeli yükle
model, class_names = load_model(model_path)
print(f"Model yüklendi! Sınıflar: {class_names}")

# Gradio ara yüzü
def predict_and_visualize(img):
    if img is None:
        return None, "Lütfen bir görüntü yükleyin."
    
    # Tahmin yap
    result = predict_image(img, model, class_names)
    
    # Görselleştirme
    fig = create_prediction_plot(img, result)
    
    # Detaylı sonuç metni
    result_text = f"""
    ## Tahmin Sonucu
    - **Tahmin:** {result['tahmin']}
    - **Güven:** {result['güven']:.2f}%
    - **Çürük Olma Olasılığı:** {result['çürük_olasılığı']:.2f}%
    """
    
    return fig, result_text

# Gradio arayüzü
demo = gr.Interface(
    fn=predict_and_visualize,
    inputs=gr.Image(type="pil"),
    outputs=[
        gr.Plot(label="Tahmin Sonucu"),
        gr.Markdown(label="Detaylar")
    ],
    title="Taze & Çürük Meyve Sebze Tespit Sistemi",
    description="ResNet18 transfer learning kullanarak meyve ve sebzelerin taze mi çürük mü olduğunu tespit eden model.",
    examples=[
        ["Test/freshapples/saltandpepper_Screen Shot 2018-06-08 at 5.28.10 PM.png"],
        ["Test/rottenapples/vertical_flip_Screen Shot 2018-06-08 at 2.48.00 PM.png"],
        ["Test/freshtamto/t_f200.png"],
        ["Test/rottentamto/t_r010.png"]
    ],
    theme=gr.themes.Monochrome(),
    allow_flagging="never"
)

# Uygulamayı başlat
if __name__ == "__main__":
    demo.launch(share=True) 