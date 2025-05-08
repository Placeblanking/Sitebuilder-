const editor = grapesjs.init({
  container: '#editor',
  height: '100%',
  width: '100%',
  fromElement: true,
  storageManager: false,
  // Change the default drag mode to be more suitable for template import
  dragMode: 'translate',
  plugins: ['gjs-blocks-basic'],
  pluginsOpts: {
    'gjs-blocks-basic': {
      flexGrid: true
    }
  },
  blockManager: {
    appendTo: '#blocks',
    blocks: [
      { id: 'section', label: 'Section', category: 'Layout', content: '<section class="section-block" style="min-height:100px;"></section>', attributes: { class: 'fa fa-object-group' } },
      { id: 'container', label: 'Container', category: 'Layout', content: '<div class="container-block" style="min-height:100px;width:100%;"></div>', attributes: { class: 'fa fa-cube' } },
      { id: 'row', label: 'Row', category: 'Layout', content: '<div class="row" style="display:flex;min-height:75px;width:100%;"></div>', attributes: { class: 'fa fa-columns' } },
      { id: 'column', label: 'Column', category: 'Layout', content: '<div class="column" style="flex:1;min-height:75px;"></div>', attributes: { class: 'fa fa-expand' } },
      { id: 'text', label: 'Text', category: 'Basic', content: '<div data-gjs-type="text">Insert your text here</div>', attributes: { class: 'fa fa-font' } },
      { id: 'image', label: 'Image', category: 'Basic', content: '<img src="https://via.placeholder.com/350x250" style="max-width:100%;">', attributes: { class: 'fa fa-picture-o' } },
      { id: 'video', label: 'Video', category: 'Basic', content: { type: 'video', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', style: { width: '100%', height: '340px' } }, attributes: { class: 'fa fa-youtube-play' } },
      { id: 'link', label: 'Link', category: 'Basic', content: '<a href="#">Link Text</a>', attributes: { class: 'fa fa-link' } },
      { id: 'form', label: 'Form', category: 'Forms', content: '<form><input type="text" placeholder="Name" /><input type="email" placeholder="Email" /><button>Submit</button></form>', attributes: { class: 'fa fa-wpforms' } },
      { id: 'input', label: 'Input', category: 'Forms', content: '<input type="text" placeholder="Input Text">', attributes: { class: 'fa fa-terminal' } },
      { id: 'button', label: 'Button', category: 'Forms', content: '<button>Click Me</button>', attributes: { class: 'fa fa-square' } },
      { id: 'navbar', label: 'Navbar', category: 'Components', content: '<nav><a href="#">Home</a> <a href="#">About</a></nav>', attributes: { class: 'fa fa-bars' } },
      { id: 'card', label: 'Card', category: 'Components', content: '<div class="card"><h3>Card Title</h3><p>Some content</p></div>', attributes: { class: 'fa fa-id-card-o' } },
      { id: 'heading1', label: 'Heading 1', category: 'Typography', content: '<h1>Heading 1</h1>', attributes: { class: 'fa fa-header' } },
      { id: 'paragraph', label: 'Paragraph', category: 'Typography', content: '<p>This is a paragraph.</p>', attributes: { class: 'fa fa-paragraph' } }
    ]
  },
  styleManager: {
    appendTo: '#style-manager',
    sectors: [
      { name: 'Positioning', open: false, buildProps: ['position', 'top', 'left', 'z-index'] },
      { name: 'Dimension', open: false, buildProps: ['width', 'height', 'max-width', 'min-height'] },
      { name: 'Typography', open: false, buildProps: ['font-family', 'font-size', 'color', 'line-height', 'letter-spacing', 'text-align', 'text-decoration'] },
      { name: 'Decorations', open: false, buildProps: ['background-color', 'border', 'border-radius', 'box-shadow'] },
      { name: 'Flex', open: false, buildProps: ['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'order', 'flex-basis', 'flex-grow', 'flex-shrink', 'align-self'] },
      { name: 'Extra', open: false, buildProps: ['transition', 'perspective', 'transform'] }
    ]
  },
  // Canvas settings for better layout
  canvas: {
    styles: [
      'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap'
    ]
  }
});

// Keep track of import mode
let isTemplateImport = false;

editor.on('component:add', (component) => {
  // Only apply default positioning to components added through blocks
  // Skip for components added during template import
  if (!isTemplateImport) {
    component.addStyle({
      'position': 'absolute',
      'left': '50px',
      'top': '50px',
      'z-index': '1',
      'resize': 'both',
      'overflow': 'auto',
      'min-width': '100px',
      'min-height': '100px'
    });
    component.set({
      resizable: {
        tl: 0, tc: 0, tr: 0,
        cl: 0, cr: 0,
        bl: 0, bc: 0, br: 1
      }
    });
  }
});

// Function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Check if there's a template parameter and load it when the editor is ready
document.addEventListener('DOMContentLoaded', () => {
  const templatePath = getUrlParameter('template');
  if (templatePath) {
    loadTemplateFromPath('blog/' + templatePath);
  }
});

// Function to load a template from a path
function loadTemplateFromPath(path) {
  fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.text();
    })
    .then(content => {
      // Set template import flag
      isTemplateImport = true;
      
      // Clear the canvas first
      editor.setComponents('');
      
      try {
        // Create a temporary container to parse the HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        
        // Extract CSS from style tags
        const styleTags = tempContainer.querySelectorAll('style');
        let cssContent = '';
        styleTags.forEach(styleTag => {
          cssContent += styleTag.textContent;
          // Remove the style tag so it doesn't get added to the components
          styleTag.remove();
        });
        
        // Extract link tags for external CSS
        const linkTags = tempContainer.querySelectorAll('link[rel="stylesheet"]');
        linkTags.forEach(linkTag => {
          const href = linkTag.getAttribute('href');
          if (href) {
            // Add external stylesheets to the canvas
            editor.Canvas.getDocument().head.appendChild(linkTag.cloneNode(true));
          }
          // Remove the link tag so it doesn't get added to the components
          linkTag.remove();
        });
        
        // Extract body content or main content
        let bodyContent = '';
        const bodyTag = tempContainer.querySelector('body');
        if (bodyTag) {
          bodyContent = bodyTag.innerHTML;
        } else {
          bodyContent = tempContainer.innerHTML;
        }
        
        // Create a wrapper to hold the entire template contents
        // This ensures it fills the canvas
        const wrapper = {
          tagName: 'div',
          attributes: {
            class: 'template-wrapper',
            style: 'width: 100%; min-height: 100%; position: relative;'
          },
          components: bodyContent
        };
        
        // Add the wrapper and CSS
        editor.setComponents(wrapper);
        
        if (cssContent) {
          editor.setStyle(cssContent);
        }
        
        // Show a success message
        console.log('Template loaded successfully!');
      } catch (error) {
        console.error('Error parsing template:', error);
        alert('Error loading template. Please make sure the HTML is valid.');
      }
      
      // Reset template import flag
      setTimeout(() => {
        isTemplateImport = false;
      }, 100);
    })
    .catch(error => {
      console.error('Error loading template file:', error);
      alert('Could not load the template file. Please check the path and try again.');
    });
}

function handleFileUpload(type) {
  const input = document.createElement('input');
  input.type = 'file';
  
  if (type === 'image') {
    input.accept = 'image/*';
  } else if (type === 'video') {
    input.accept = 'video/*';
  } else if (type === 'template') {
    input.accept = '.html,.htm';
  }
  
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = evt => {
      const content = evt.target.result;
      
      if (type === 'image') {
        const imgComponent = `<img src="${content}" style="max-width:300px; position:absolute; left:50px; top:50px;"/>`;
        editor.addComponents(imgComponent);
      } else if (type === 'video') {
        const videoComponent = `<video controls src="${content}" style="max-width:400px; position:absolute; left:50px; top:50px;"/>`;
        editor.addComponents(videoComponent);
      } else if (type === 'template') {
        // Clear the canvas first
        editor.setComponents('');
        
        try {
          // Create a temporary container to parse the HTML
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = content;
          
          // Extract CSS from style tags
          const styleTags = tempContainer.querySelectorAll('style');
          let cssContent = '';
          styleTags.forEach(styleTag => {
            cssContent += styleTag.textContent;
            // Remove the style tag so it doesn't get added to the components
            styleTag.remove();
          });
          
          // Extract link tags for external CSS
          const linkTags = tempContainer.querySelectorAll('link[rel="stylesheet"]');
          linkTags.forEach(linkTag => {
            const href = linkTag.getAttribute('href');
            if (href) {
              // Add external stylesheets to the canvas
              editor.Canvas.getDocument().head.appendChild(linkTag.cloneNode(true));
            }
            // Remove the link tag so it doesn't get added to the components
            linkTag.remove();
          });
          
          // Extract body content or main content
          let bodyContent = '';
          const bodyTag = tempContainer.querySelector('body');
          if (bodyTag) {
            bodyContent = bodyTag.innerHTML;
          } else {
            bodyContent = tempContainer.innerHTML;
          }
          
          // Set template import flag
          isTemplateImport = true;
          
          // Create a wrapper to hold the entire template contents
          // This ensures it fills the canvas
          const wrapper = {
            tagName: 'div',
            attributes: {
              class: 'template-wrapper',
              style: 'width: 100%; min-height: 100%; position: relative;'
            },
            components: bodyContent
          };
          
          // Add the wrapper and CSS
          editor.setComponents(wrapper);
          
          if (cssContent) {
            editor.setStyle(cssContent);
          }
          
          // Reset template import flag
          setTimeout(() => {
            isTemplateImport = false;
          }, 100);
          
          // Show a success message
          alert('Template imported successfully!');
        } catch (error) {
          console.error('Error parsing template:', error);
          alert('Error importing template. Please make sure the HTML is valid.');
          isTemplateImport = false;
        }
      }
    };
    
    if (type === 'template') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };
  
  input.click();
}

document.getElementById('uploadImage').addEventListener('click', () => handleFileUpload('image'));
document.getElementById('uploadVideo').addEventListener('click', () => handleFileUpload('video'));
document.getElementById('uploadTemplate').addEventListener('click', () => handleFileUpload('template'));
document.getElementById('preview').addEventListener('click', () => {
  const win = window.open('', '_blank');
  win.document.write('<!DOCTYPE html><html><head>');
  win.document.write('<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">');
  win.document.write('<title>Webstruct Preview</title>');
  win.document.write('</head><body>');
  win.document.write(editor.getHtml());
  win.document.write('<style>' + editor.getCss() + '</style>');
  win.document.write('</body></html>');
  win.document.close();
});
document.getElementById('viewCode').addEventListener('click', () => {
  alert(editor.getHtml() + '\n\n' + editor.getCss());
});
document.getElementById('clear').addEventListener('click', () => {
  editor.setComponents('');
});