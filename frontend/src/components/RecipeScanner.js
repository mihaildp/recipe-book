import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import Webcam from 'react-webcam';
import { Camera, Upload, X, Edit3, Eye, FileText, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const RecipeScanner = ({ onExtracted, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [imageSource, setImageSource] = useState(null);
  const [progress, setProgress] = useState(0);
  const [captureMode, setCaptureMode] = useState('upload'); // 'upload' or 'camera'
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Parse recipe text intelligently
  const parseRecipeText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract title (usually first line or largest text)
    const title = lines[0] || 'Untitled Recipe';
    
    // Find ingredients section
    const ingredientsStart = lines.findIndex(line => 
      /ingredient|INGREDIENT/i.test(line)
    );
    
    // Find instructions section
    const instructionsStart = lines.findIndex(line => 
      /instruction|direction|method|step|INSTRUCTION|DIRECTION|METHOD|STEP/i.test(line)
    );
    
    // Extract ingredients
    const ingredients = [];
    if (ingredientsStart !== -1) {
      for (let i = ingredientsStart + 1; i < lines.length; i++) {
        if (instructionsStart !== -1 && i >= instructionsStart) break;
        const line = lines[i].trim();
        // Check if line looks like an ingredient (has measurements or food items)
        if (line && !line.match(/^(instruction|direction|method|step)/i)) {
          // Clean up common OCR issues
          const cleaned = line
            .replace(/^\d+\.\s*/, '') // Remove numbering
            .replace(/^[-•]\s*/, '') // Remove bullets
            .trim();
          if (cleaned) ingredients.push(cleaned);
        }
      }
    }
    
    // Extract instructions
    const instructions = [];
    if (instructionsStart !== -1) {
      for (let i = instructionsStart + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Clean up step numbers
          const cleaned = line
            .replace(/^(step\s+)?\d+[:.)]\s*/i, '')
            .trim();
          if (cleaned) instructions.push(cleaned);
        }
      }
    }

    // Try to extract metadata
    const metadata = {
      servings: null,
      prepTime: null,
      cookTime: null,
      category: '',
      region: ''
    };

    // Extract servings
    const servingsMatch = text.match(/(?:serves?|servings?|yield)[:.\s]+(\d+)/i);
    if (servingsMatch) {
      metadata.servings = parseInt(servingsMatch[1]);
    }

    // Extract prep time
    const prepMatch = text.match(/prep(?:aration)?\s+time[:.\s]+(\d+)\s*(min|hour)/i);
    if (prepMatch) {
      metadata.prepTime = prepMatch[2].toLowerCase().includes('hour') 
        ? parseInt(prepMatch[1]) * 60 
        : parseInt(prepMatch[1]);
    }

    // Extract cook time
    const cookMatch = text.match(/cook(?:ing)?\s+time[:.\s]+(\d+)\s*(min|hour)/i);
    if (cookMatch) {
      metadata.cookTime = cookMatch[2].toLowerCase().includes('hour') 
        ? parseInt(cookMatch[1]) * 60 
        : parseInt(cookMatch[1]);
    }
    
    return {
      title,
      ingredients: ingredients.length > 0 ? ingredients : [''],
      instructions: instructions.length > 0 ? instructions : [''],
      prepTime: metadata.prepTime || 0,
      cookTime: metadata.cookTime || 0,
      servings: metadata.servings || 4,
      category: metadata.category,
      region: metadata.region,
      extractedText: text,
      imageSource
    };
  };

  // Scan image with Tesseract
  const scanRecipe = async (imageData) => {
    setScanning(true);
    setProgress(0);
    
    try {
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const parsedRecipe = parseRecipeText(result.data.text);
      setExtractedData(parsedRecipe);
      setShowPreview(true);
      toast.success('Recipe scanned successfully!');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to scan recipe. Please try again.');
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSource(imageSrc);
    scanRecipe(imageSrc);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target.result;
        setImageSource(imageSrc);
        scanRecipe(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit handler for preview
  const handleEdit = (field, value) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add ingredient
  const addIngredient = () => {
    setExtractedData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  // Update ingredient
  const updateIngredient = (index, value) => {
    const newIngredients = [...extractedData.ingredients];
    newIngredients[index] = value;
    setExtractedData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  // Remove ingredient
  const removeIngredient = (index) => {
    if (extractedData.ingredients.length > 1) {
      setExtractedData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  // Add instruction
  const addInstruction = () => {
    setExtractedData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  // Update instruction
  const updateInstruction = (index, value) => {
    const newInstructions = [...extractedData.instructions];
    newInstructions[index] = value;
    setExtractedData(prev => ({ ...prev, instructions: newInstructions }));
  };

  // Remove instruction
  const removeInstruction = (index) => {
    if (extractedData.instructions.length > 1) {
      setExtractedData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {!showPreview ? (
          // Scanning Interface
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Scan Recipe from Photo</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selection */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setCaptureMode('upload')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  captureMode === 'upload'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload Photo
              </button>
              <button
                onClick={() => setCaptureMode('camera')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  captureMode === 'camera'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-5 h-5 inline mr-2" />
                Take Photo
              </button>
            </div>

            {/* Capture Interface */}
            {captureMode === 'upload' ? (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-400 transition-colors cursor-pointer"
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Click to upload a recipe photo
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, GIF up to 10MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: "environment"
                    }}
                  />
                </div>
                <button
                  onClick={capturePhoto}
                  disabled={scanning}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Capture Recipe
                </button>
              </div>
            )}

            {/* Scanning Progress */}
            {scanning && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Scanning recipe...</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  <Loader className="w-4 h-4 inline animate-spin mr-2" />
                  Extracting text from image...
                </p>
              </div>
            )}
          </div>
        ) : (
          // Preview & Edit Interface
          <div>
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Review Scanned Recipe</h2>
                  <p className="text-gray-600 mt-1">
                    Review and edit the extracted recipe before saving
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 font-semibold flex items-center gap-2 ${
                  activeTab === 'preview'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-6 py-3 font-semibold flex items-center gap-2 ${
                  activeTab === 'edit'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setActiveTab('original')}
                className={`px-6 py-3 font-semibold flex items-center gap-2 ${
                  activeTab === 'original'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Original Text
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{extractedData.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      {extractedData.prepTime > 0 && (
                        <span>Prep: {extractedData.prepTime} min</span>
                      )}
                      {extractedData.cookTime > 0 && (
                        <span>Cook: {extractedData.cookTime} min</span>
                      )}
                      {extractedData.servings > 0 && (
                        <span>Servings: {extractedData.servings}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Ingredients</h4>
                    <ul className="space-y-1">
                      {extractedData.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Instructions</h4>
                    <ol className="space-y-2">
                      {extractedData.instructions.map((inst, idx) => (
                        <li key={idx} className="flex">
                          <span className="font-bold text-orange-500 mr-3">{idx + 1}.</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {imageSource && (
                    <div>
                      <h4 className="font-bold mb-2">Scanned Image</h4>
                      <img src={imageSource} alt="Scanned recipe" className="rounded-lg max-w-full" />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'edit' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Recipe Title</label>
                    <input
                      type="text"
                      value={extractedData.title}
                      onChange={(e) => handleEdit('title', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Prep Time (min)</label>
                      <input
                        type="number"
                        value={extractedData.prepTime}
                        onChange={(e) => handleEdit('prepTime', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Cook Time (min)</label>
                      <input
                        type="number"
                        value={extractedData.cookTime}
                        onChange={(e) => handleEdit('cookTime', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Servings</label>
                      <input
                        type="number"
                        value={extractedData.servings}
                        onChange={(e) => handleEdit('servings', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Ingredients</label>
                    {extractedData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        />
                        {extractedData.ingredients.length > 1 && (
                          <button
                            onClick={() => removeIngredient(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addIngredient}
                      className="mt-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 font-semibold"
                    >
                      + Add Ingredient
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Instructions</label>
                    {extractedData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-2">
                          {index + 1}
                        </span>
                        <textarea
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none min-h-[60px]"
                        />
                        {extractedData.instructions.length > 1 && (
                          <button
                            onClick={() => removeInstruction(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 h-fit"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addInstruction}
                      className="mt-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 font-semibold"
                    >
                      + Add Step
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'original' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Original text extracted from the image:
                  </p>
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded-lg">
                    {extractedData.extractedText}
                  </pre>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t flex gap-4">
              <button
                onClick={() => {
                  onExtracted(extractedData);
                  setShowPreview(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Use This Recipe
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setExtractedData(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Scan Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeScanner;