// Reduce blend to 0
    hole.blendRadius = hole.repairData.initialBlend * (1.0 - t);
    
  } else if (hole.repairData.type === 'laser') {