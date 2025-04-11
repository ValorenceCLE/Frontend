// src/utils/routeProgress.js
export const setupRouteProgress = (router) => {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.width = '0%';
    progressBar.style.height = '2px';
    progressBar.style.backgroundColor = '#1e3a8a';
    progressBar.style.transition = 'width 0.2s';
    progressBar.style.zIndex = '9999';
    document.body.appendChild(progressBar);
  
    // Progress functionality
    let timer = null;
    
    const start = () => {
      // Reset
      progressBar.style.width = '0%';
      progressBar.style.opacity = '1';
      
      // Animate to 80%
      clearInterval(timer);
      let width = 0;
      timer = setInterval(() => {
        if (width < 80) {
          width += (80 - width) * 0.2;
          progressBar.style.width = `${width}%`;
        } else {
          clearInterval(timer);
        }
      }, 100);
    };
    
    const done = () => {
      clearInterval(timer);
      progressBar.style.width = '100%';
      
      // Hide after completion
      setTimeout(() => {
        progressBar.style.opacity = '0';
        setTimeout(() => {
          progressBar.style.width = '0%';
        }, 300);
      }, 200);
    };
    
    // Set up router hooks
    router.beforeEach((to, from, next) => {
      start();
      next();
    });
    
    router.afterEach(() => {
      done();
    });
    
    router.onError(() => {
      done();
    });
  };