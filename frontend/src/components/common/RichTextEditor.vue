<!--
  Proyecto: PORTAL SIPPASE - ROBITCMS
  Autor: Christian Mollo
  Contacto: gnuchrismo@gmail.com | LinkedIn: https://www.linkedin.com/in/gnuchrismo/?locale=es_ES
  Patrocinado por: UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025

  Licencia: PROPIETARIA - Uso exclusivo autorizado para la entidad beneficiaria.
  Queda prohibida la copia, distribución, modificación o uso no autorizado.

  Advertencia: Algunas partes de este proyecto utilizan librerías o frameworks
  de terceros bajo licencias propias (por ejemplo Quasar Framework - MIT License).
  Se debe cumplir con todas las licencias externas involucradas.

  © 2025 Desarrollado por Christian Mollo - UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025, Todos los derechos reservados.
-->
<template>
  <div class="rich-text-editor shadow-2 rounded-borders">
    <!-- Toolbar -->
    <q-toolbar class="bg-grey-2 q-pa-xs rounded-borders-top">
      <div class="row q-gutter-xs">
        <q-btn-group flat>
          <q-btn
            flat dense size="sm" icon="format_bold"
            :color="editor?.isActive('bold') ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleBold().run()"
          >
            <q-tooltip>Negrita</q-tooltip>
          </q-btn>
          <q-btn
            flat dense size="sm" icon="format_italic"
            :color="editor?.isActive('italic') ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleItalic().run()"
          >
            <q-tooltip>Cursiva</q-tooltip>
          </q-btn>
          <q-btn
            flat dense size="sm" icon="strikethrough_s"
            :color="editor?.isActive('strike') ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleStrike().run()"
          >
            <q-tooltip>Tachado</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-separator vertical inset />

        <q-btn-group flat>
          <q-btn
            flat dense size="sm" icon="format_quote"
            :color="editor?.isActive('blockquote') ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleBlockquote().run()"
          >
            <q-tooltip>Cita</q-tooltip>
          </q-btn>
          <q-btn
            flat dense size="sm" icon="code"
            :color="editor?.isActive('codeBlock') ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleCodeBlock().run()"
          >
            <q-tooltip>Código</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-separator vertical inset />

        <q-btn-group flat>
          <q-btn
            flat dense size="sm" label="H1"
            :color="editor?.isActive('heading', { level: 1 }) ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          />
          <q-btn
            flat dense size="sm" label="H2"
            :color="editor?.isActive('heading', { level: 2 }) ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          />
          <q-btn
            flat dense size="sm" label="H3"
            :color="editor?.isActive('heading', { level: 3 }) ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
          />
        </q-btn-group>

        <q-separator vertical inset />

        <q-btn-group flat>
          <q-btn
            flat dense size="sm" icon="format_list_bulleted"
            :color="editor?.isActive('bulletList') ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleBulletList().run()"
          >
            <q-tooltip>Lista con viñetas</q-tooltip>
          </q-btn>
          <q-btn
            flat dense size="sm" icon="format_list_numbered"
            :color="editor?.isActive('orderedList') ? 'primary' : 'grey-8'"
            @click="editor?.chain().focus().toggleOrderedList().run()"
          >
            <q-tooltip>Lista numerada</q-tooltip>
          </q-btn>
        </q-btn-group>
        
        <q-separator vertical inset />
        
        <q-btn-group flat>
             <q-btn
            flat dense size="sm" icon="link"
            :color="editor?.isActive('link') ? 'primary' : 'grey-8'"
            @click="setLink"
          >
            <q-tooltip>Enlace</q-tooltip>
          </q-btn>
            <q-btn
            flat dense size="sm" icon="link_off"
            :disable="!editor?.isActive('link')"
            @click="editor?.chain().focus().unsetLink().run()"
          >
            <q-tooltip>Quitar enlace</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-separator vertical inset />

        <q-btn-group flat>
          <q-btn flat dense size="sm" icon="undo" @click="editor?.chain().focus().undo().run()">
            <q-tooltip>Deshacer</q-tooltip>
          </q-btn>
          <q-btn flat dense size="sm" icon="redo" @click="editor?.chain().focus().redo().run()">
            <q-tooltip>Rehacer</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </q-toolbar>

    <q-separator />

    <!-- Editor Content -->
    <editor-content 
      :editor="editor" 
      class="editor-content q-pa-md"
      :style="{ minHeight: height + 'px' }"
    />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { watch, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 400
  }
});

const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
  content: props.modelValue,
  editable: true,
  editorProps: {
    attributes: {
      class: 'prose max-w-none focus:outline-none',
      style: 'min-height: 100%; outline: none;'
    }
  },
  onCreate({ editor }) {
    console.log('✅ RichTextEditor created', { editable: editor.isEditable, content: editor.getHTML() });
  },
  extensions: [
    StarterKit.configure({
      link: false // Disable default link to avoid duplicate with manual import
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }),
    Image,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value;
  if (isSame) return;
  editor.value?.commands.setContent(value, false);
});

const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  // cancelled
  if (url === null) {
    return
  }

  // empty
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // update link
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style lang="scss">
.rich-text-editor {
  border: 1px solid #e0e0e0;
  
  .editor-content {
    cursor: text;
    display: flex;
    flex-direction: column;
    
    // ProseMirror specific styles for better display
    .ProseMirror {
      outline: none;
      flex-grow: 1;
      min-height: 100%;
      width: 100%;
      
      p {
        margin-bottom: 0.5rem;
      }
      
      ul, ol {
        padding-left: 1.5rem;
      }
      
      blockquote {
        border-left: 3px solid #ccc;
        margin-left: 0;
        margin-right: 0;
        padding-left: 1rem;
        color: #666;
      }
      
      code {
        background-color: #f0f0f0;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: monospace;
      }
      
      pre {
        background: #0d0d0d;
        color: #fff;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        code {
          color: inherit;
          padding: 0;
          background: none;
          font-size: 0.8rem;
        }
      }
      
      img {
        max-width: 100%;
        height: auto;
      }
      
      a {
        color: #1976D2;
        cursor: pointer;
      }
    }
  }
}
</style>
