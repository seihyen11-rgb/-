import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ProteinLog, ChatMessage } from './types'; // ../types 제거
import { analyzeFoodImage, processChatMessage } from './geminiService'; // ../services/ 제거
import { 
  PhotoIcon, PaperAirplaneIcon, ClockIcon, ClipboardDocumentListIcon, CameraIcon 
} from '@heroicons/react/24/solid';

// ... (기존 DailyView 로직 유지) ...
