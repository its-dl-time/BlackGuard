import { Language } from '../types';

export const translations = {
  EN: {
    nav: {
      plan: 'Plan',
      risk: 'Risk',
      log: 'Decision Log',
      settings: 'Settings',
    },
    plan: {
      title: 'EXECUTION PLAN',
      subtitle: 'Define strategy parameters for risk auditing.',
      card_strategy: 'Strategy & Assets',
      card_horizon: 'Time Horizon',
      card_order: 'Order Configuration',
      label_strategy: 'Strategy Model',
      label_amount: 'Capital Allocation',
      label_universe: 'Asset Universe (VN30)',
      label_selected: 'Selected',
      label_horizon_short: 'Short-term',
      label_horizon_long: 'Long-term',
      label_commitment: 'Commitment Contract',
      placeholder_commitment: 'State your rationale strictly...',
      label_direction: 'Direction',
      btn_analyze: 'ANALYZE RISK',
      status_active: '> BLACKGUARD_AI ACTIVE',
      status_waiting: '> WAITING FOR INPUT...',
    },
    risk: {
      title: 'RISK ASSESSMENT',
      subtitle: 'Analysis result for',
      target_assets: 'Target Assets',
      card_context: 'Behavioral Context',
      btn_revise: 'REVISE PLAN',
      btn_execute: 'EXECUTE ORDER',
      regime: {
        stable: 'STABLE',
        caution: 'CAUTION',
        critical: 'CRITICAL'
      }
    },
    log: {
      title: 'DECISION LOG',
      subtitle: 'Audit trail of overrides.',
      empty_title: 'NO RECORDS FOUND',
      empty_desc: 'Commitment overrides will appear here.',
      badge_override: 'OVERRIDE',
      label_risk: 'RISK',
      label_assets: 'ASSETS'
    },
    settings: {
      title: 'SETTINGS',
      subtitle: 'System configuration.',
      card_interface: 'Interface',
      card_persona: 'Investor Persona',
      label_language: 'Language',
      session: 'SESSION'
    },
    strategies: {
      BUY_HOLD: 'Buy & Hold',
      MOMENTUM: 'Momentum',
      MEAN_REVERSION: 'Mean Reversion',
      TREND_FOLLOWING: 'Trend Following'
    },
    personas: {
      CONSERVATIVE: { label: 'Conservative', desc: 'Prioritizes capital preservation.' },
      BALANCED: { label: 'Balanced', desc: 'Seeks growth with moderate tolerance.' },
      AGGRESSIVE: { label: 'Aggressive', desc: 'Maximizes returns. High volatility tolerance.' }
    }
  },
  VI: {
    nav: {
      plan: 'Kế Hoạch',
      risk: 'Rủi Ro',
      log: 'Nhật Ký',
      settings: 'Cài Đặt',
    },
    plan: {
      title: 'LẬP KẾ HOẠCH',
      subtitle: 'Thiết lập thông số để đánh giá rủi ro.',
      card_strategy: 'Chiến Lược & Tài Sản',
      card_horizon: 'Khung Thời Gian',
      card_order: 'Cấu Hình Lệnh',
      label_strategy: 'Mô Hình Chiến Lược',
      label_amount: 'Phân Bổ Vốn',
      label_universe: 'Danh Mục (VN30)',
      label_selected: 'Đã chọn',
      label_horizon_short: 'Ngắn Hạn',
      label_horizon_long: 'Dài Hạn',
      label_commitment: 'Hợp Đồng Cam Kết',
      placeholder_commitment: 'Ghi rõ lý do nắm giữ...',
      label_direction: 'Vị Thế',
      btn_analyze: 'PHÂN TÍCH RỦI RO',
      status_active: '> BLACKGUARD_AI ĐANG CHẠY',
      status_waiting: '> CHỜ DỮ LIỆU ĐẦU VÀO...',
    },
    risk: {
      title: 'ĐÁNH GIÁ RỦI RO',
      subtitle: 'Kết quả phân tích cho',
      target_assets: 'Mã Cổ Phiếu',
      card_context: 'Bối Cảnh Hành Vi',
      btn_revise: 'SỬA KẾ HOẠCH',
      btn_execute: 'THỰC HIỆN LỆNH',
      regime: {
        stable: 'ỔN ĐỊNH',
        caution: 'CẨN TRỌNG',
        critical: 'NGUY HIỂM'
      }
    },
    log: {
      title: 'NHẬT KÝ QUYẾT ĐỊNH',
      subtitle: 'Lịch sử vi phạm cam kết.',
      empty_title: 'CHƯA CÓ DỮ LIỆU',
      empty_desc: 'Các lần phá vỡ cam kết sẽ hiện tại đây.',
      badge_override: 'PHÁ VỠ',
      label_risk: 'RỦI RO',
      label_assets: 'MÃ'
    },
    settings: {
      title: 'CÀI ĐẶT',
      subtitle: 'Cấu hình hệ thống.',
      card_interface: 'Giao Diện',
      card_persona: 'Hồ Sơ Nhà Đầu Tư',
      label_language: 'Ngôn Ngữ',
      session: 'PHIÊN'
    },
    strategies: {
      BUY_HOLD: 'Nắm Giữ (Buy & Hold)',
      MOMENTUM: 'Đà Tăng Trưởng (Momentum)',
      MEAN_REVERSION: 'Đảo Chiều (Mean Reversion)',
      TREND_FOLLOWING: 'Xu Hướng (Trend Following)'
    },
    personas: {
      CONSERVATIVE: { label: 'Thận Trọng', desc: 'Ưu tiên bảo toàn vốn.' },
      BALANCED: { label: 'Cân Bằng', desc: 'Tăng trưởng với rủi ro vừa phải.' },
      AGGRESSIVE: { label: 'Mạo Hiểm', desc: 'Tối đa hóa lợi nhuận. Chấp nhận biến động lớn.' }
    }
  }
};

export const getTexts = (lang: Language) => translations[lang];
