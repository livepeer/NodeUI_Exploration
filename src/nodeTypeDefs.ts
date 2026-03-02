import type { FieldDef, PipelineNodeData } from './components/PipelineNode'

export interface NodeTypeDef {
  typeId: string
  title: string
  status: PipelineNodeData['status']
  description: string
  fields: FieldDef[]
}

export const NODE_TYPE_DEFS: NodeTypeDef[] = [
  {
    typeId: 'model-selector',
    title: 'Model Selector',
    status: 'green',
    description: 'Load and configure a model checkpoint',
    fields: [
      { id: 'unet_name', label: 'Unet_name', value: 'Null' },
      { id: 'weight_dtype', label: 'Weight_dtype', value: 'Default' },
    ],
  },
  {
    typeId: 'text-encoder',
    title: 'Text Encoder',
    status: 'orange',
    description: 'Encode text using a CLIP text model',
    fields: [
      { id: 'clip_name', label: 'Clip_Name', value: 'Null' },
      { id: 'type', label: 'Type', value: 'Stable_Diffus...' },
      { id: 'device', label: 'Device', value: 'Default' },
      { id: 'other_value', label: 'Other Value', value: 'Null' },
    ],
  },
  {
    typeId: 'clip-text-encode',
    title: 'Clip Text Encode',
    status: 'gray',
    description: 'Encode a text prompt into conditioning',
    fields: [
      { id: 'value', label: 'Value', value: 'Text', textarea: true },
    ],
  },
  {
    typeId: 'k-sampler',
    title: 'K Sampler',
    status: 'orange',
    description: 'Sample the latent space using a scheduler',
    fields: [
      { id: 'clip_name', label: 'Clip_Name', value: 'Null' },
      { id: 'type', label: 'Type', value: 'Stable_Diffus...' },
      { id: 'device', label: 'Device', value: 'Default' },
      { id: 'other_value_1', label: 'Other Value', value: 'Null' },
      { id: 'other_value_2', label: 'Other Value', value: 'Null' },
      { id: 'other_value_3', label: 'Other Value', value: 'Null' },
    ],
  },
  {
    typeId: 'vae-decode',
    title: 'VAE Decode',
    status: 'green',
    description: 'Decode a latent sample into an image',
    fields: [
      { id: 'samples', label: 'Samples', value: 'Null' },
      { id: 'vae', label: 'VAE', value: 'Default' },
    ],
  },
  {
    typeId: 'load-image',
    title: 'Load Image',
    status: 'gray',
    description: 'Load an image from disk as input',
    fields: [
      { id: 'image', label: 'Image', value: 'None' },
      { id: 'upload', label: 'Upload', value: 'image' },
    ],
  },
  {
    typeId: 'empty-latent',
    title: 'Empty Latent',
    status: 'gray',
    description: 'Create an empty latent noise tensor',
    fields: [
      { id: 'width', label: 'Width', value: '512' },
      { id: 'height', label: 'Height', value: '512' },
      { id: 'batch_size', label: 'Batch Size', value: '1' },
    ],
  },
  {
    typeId: 'save-image',
    title: 'Save Image',
    status: 'green',
    description: 'Export and save the output image',
    fields: [
      { id: 'images', label: 'Images', value: 'Null' },
      { id: 'filename', label: 'Filename', value: 'output' },
    ],
  },
]
