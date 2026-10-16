import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';

// ⚠️ EmailJS 키 정보
const EMAILJS_SERVICE_ID = 'service_z48cral';
const EMAILJS_TEMPLATE_ID = 'template_ppm30h9';
const EMAILJS_PUBLIC_KEY = 'qi8lkMugMKocXZa4K'; 

const MODELS = [
  { 
    id: 'iatf16949', 
    name: 'IATF 16949', 
    shortDesc: '자동차 산업 품질경영시스템 규격', 
    subtitle: 'Global Automotive Quality Management System',
    target: '완성차 제조업체 및 Tier & Sub-tire 등 전 자동차 공급망 조직',
    rule6thApplicability: {
      title: 'IATF 16949 인증 획득을 위한 규칙 6판 (Rule 6th) 인증 적용성',
      description: 'IATF 16949 인증 획득을 위한 규칙 6판 (Rule 6th)의 인증 적용성에 따라 다음과 같은 경우 인증을 취득할 수 있습니다.',
      items: [
        '1) 자동차 산업 제품 및 차량을 제조하는 조직',
        '2) “자동차 산업 차량”은 공공 도로에서 주행하는 동종의 차량으로 이해',
        '3) “자동차 산업 제품”은 다음과 같이 이해',
        '   (1) 자동차 산업 고객의 규격/시방에 따라 제조되고, 제조 과정에서 자동차에 통합되는 부품 (소프트웨어가 내장된 부품 포함) 및 가공 재료 (생산 부품 또는 생산재료)',
        '   (2) OEM에 의해 조달되거나 출하되는 OEM 규격/시방으로 제조되는 부품과 제조 후 그리고 최종 고객에게 인도 전 또는 후에 자동차 산업 차량에 통합되는 부품'
      ]
    },
    corePoints: [
      '고객 특정 요구사항(CSR) 준수 및 프로세스 접근법 적용',
      '제품 안전(Product Safety) 및 제조타당성(Feasibility) 확보',
      '비상대응 계획, 억제(Containment) 및 오류 예방(Error-proofing)',
      '핵심 도구(APQP, PPAP, FMEA, SPC, MSA)의 완벽한 실무 통합'
    ],
    detail: 'IATF 16949는 ISO 9001을 바탕으로 자동차 산업의 특수 요구사항이 결합된 최고 수준의 품질경영시스템입니다. 결함 예방, 공급망 내 산포 및 낭비 감소를 목표로 하며, 글로벌 자동차 OEM에 납품하기 위한 필수 자격 요건입니다.' 
  },
  { 
    id: 'iso9001', 
    name: 'ISO 9001', 
    shortDesc: '품질경영시스템 표준', 
    subtitle: 'Quality Management System',
    target: '제조, 서비스, IT, 공공기관 등 모든 산업 분야의 조직',
    corePoints: [
      '고객 만족(Customer Satisfaction) 및 요구사항 충족 프로세스',
      '리스크 기반 사고(Risk-based Thinking)를 통한 선제적 리스크 관리',
      '프로세스 성과 지표(KPI) 설정 및 지속적인 모니터링',
      '최고경영자의 리더십 및 지속적 개선(Continual Improvement) 체계'
    ],
    detail: 'ISO 9001은 모든 산업과 규모의 조직에 적용할 수 있는 범용 품질경영시스템 국제 표준입니다. 고객에게 일관된 제품과 서비스를 제공하고, 업무 프로세스의 효율성을 극대화하여 조직의 체질을 근본적으로 개선합니다.' 
  },
  { 
    id: 'iso14001', 
    name: 'ISO 14001', 
    shortDesc: '환경경영시스템 표준', 
    subtitle: 'Environmental Management System',
    target: '환경 법규 준수 및 친환경 경영을 추구하는 모든 기업',
    corePoints: [
      '환경 측면(Environmental Aspects) 식별 및 유해 영향 최소화',
      '국내외 환경 법규 및 규제 준수(Compliance Obligation) 평가',
      '전과정 관점(Life Cycle Perspective)의 친환경 제품·서비스 기획',
      '오염 예방 및 폐기물 감축을 위한 지속 가능한 목표 수립'
    ],
    detail: 'ISO 14001은 기업이 환경 성과를 체계적으로 통제하고 개선할 수 있도록 돕는 국제 표준입니다. 기후변화 대응 및 ESG 경영 요구에 발맞추어 환경 리스크를 효과적으로 관리하고 기업 이미지를 제고합니다.' 
  },
  { 
    id: 'iso45001', 
    name: 'ISO 45001', 
    shortDesc: '안전보건경영시스템 표준', 
    subtitle: 'Occupational Health and Safety Management System',
    target: '중대재해처벌법 대응 및 안전한 일터 조성을 원하는 기업',
    corePoints: [
      '작업장 유해·위험요인(Hazards) 발굴 및 위험성평가(Risk Assessment)',
      '근로자 참여 및 협의를 통한 안전보건 문화 정착',
      '비상사태 대비 및 대응 절차 구축',
      '산업재해 예방 및 근로자 건강장해 방지 프로세스'
    ],
    detail: 'ISO 45001은 조직 내 안전보건 리스크를 체계적으로 제거하여 산업재해를 예방하고 안전한 근무환경을 구축하기 위한 최고 권위의 표준입니다. 최근 강화된 중대재해처벌법 및 글로벌 안전 규제 대응의 핵심 솔루션입니다.' 
  },
  { 
    id: 'iso37001', 
    name: 'ISO 37001', 
    shortDesc: '부패방지경영시스템 표준', 
    subtitle: 'Anti-Bribery Management System',
    target: '투명하고 윤리적인 경영 체계 확립이 필요한 공공 및 민간 기업',
    corePoints: [
      '뇌물수수 리스크 식별(Bribery Risk Assessment) 및 등급화',
      '부패방지 준법 통제 기준 및 실사(Due Diligence) 프로세스',
      '이해관계자(파트너, 공급업체) 리스크 검증',
      '위반 행위 신고 채널 및 내부 감사 체계 운영'
    ],
    detail: 'ISO 37001은 조직 내 부패 리스크를 식별하고 통제하여 뇌물수수 및 부패 행위를 예방하는 글로벌 윤리경영 표준입니다. 기업의 법적 리스크를 방어하고 대외 신뢰도를 획기적으로 높여줍니다.' 
  },
  { 
    id: 'iso37301', 
    name: 'ISO 37301', 
    shortDesc: '컴플라이언스(규준준수)경영시스템 표준', 
    subtitle: 'Compliance Management System',
    target: '전사적 법규 준수 및 준법 리스크 관리 체계가 필요한 기업',
    corePoints: [
      '조직이 준수해야 할 법적 의무 및 규정(Compliance Obligations) 식별',
      '준법 리스크 평가 및 통제 활동 수립',
      '컴플라이언스 책임자(CCO) 중심의 거버넌스 구축',
      '임직원 준법 교육 및 위반 시 시정 조치 프로세스'
    ],
    detail: 'ISO 37301은 조직이 직면한 법적, 규제적 요구사항과 윤리적 기준을 전사적으로 준수하도록 관리하는 통합 컴플라이언스 표준입니다. ISO 37001과 연계하여 완벽한 거버넌스를 구축할 수 있습니다.' 
  },
];

const PROCESS_STEPS = [
  { step: '01', title: '계약 체결', desc: '컨설팅 범위 및 일정 협의 후 계약 체결' },
  { step: '02', title: 'Kick-off Meeting', desc: '프로젝트 착수 회의 및 전담 태스크포스(TF) 구성' },
  { step: '03', title: 'Gap 분석', desc: '현 수준 정밀 진단 및 개선 과제 도출' },
  { step: '04', title: '경영시스템 구축 / 교육', desc: '매뉴얼·절차서 제정 및 임직원 실무 교육' },
  { step: '05', title: '실행 모니터링', desc: '시범 운영 검증 및 내부심사원 양성' },
  { step: '06', title: '심사 준비 상태 점검', desc: '최종 모의 심사 실시 및 보완 조치' },
  { step: '07', title: '심사 수행', desc: '인증기관 심사 입회 및 최종 인증 획득 지원' },
];

interface InquiryPost {
  id: string | number;
  date: string;
  author: string;
  email: string;
  isSecret: boolean;
  password?: string;
  standards: string[];
  employeeCount?: string;
  businessStatus?: string;
  hasProductDesign?: string;
  details?: string;
  message: string;
  reply?: string;
}

function BmciLogo({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', fontFamily: '"Arial Black", "Impact", sans-serif', userSelect: 'none', transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      <div style={{ backgroundColor: '#f28c18', padding: '2px 8px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}>
        <span style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.5px', lineHeight: '1' }}>BM</span>
      </div>
      <span style={{ color: '#000000', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.5px', lineHeight: '1' }}>CI</span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'models' | 'process' | 'inquiry' | 'admin'>('home');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);

  const [posts, setPosts] = useState<InquiryPost[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      if (data) {
        const formattedPosts: InquiryPost[] = data.map((item: any) => ({
          id: item.id,
          date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          author: item.author || '익명',
          email: item.email || '',
          isSecret: item.is_secret || false,
          password: item.password || '',
          standards: item.standards ? item.standards.split(',').map((s: string) => s.trim()) : [],
          employeeCount: item.employee_count || '',
          businessStatus: item.business_status || '',
          hasProductDesign: typeof item.has_product_design === 'boolean' ? (item.has_product_design ? '예' : '아니오') : (item.has_product_design || '아니오'),
          details: item.details || '',
          message: item.content || item.message || '',
          reply: item.reply || ''
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error('fetchPosts catch error:', err);
    }
  };

  const [inquiryView, setInquiryView] = useState<'list' | 'write' | 'detail'>('list');
  const [selectedPost, setSelectedPost] = useState<InquiryPost | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');

  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [employeeCount, setEmployeeCount] = useState('');
  const [businessStatus, setBusinessStatus] = useState('');
  const [hasProductDesign, setHasProductDesign] = useState<'예' | '아니오'>('아니오');
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState('');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  const handleCheckboxChange = (stdName: string) => {
    if (selectedStandards.includes(stdName)) {
      setSelectedStandards(selectedStandards.filter(s => s !== stdName));
    } else {
      setSelectedStandards([...selectedStandards, stdName]);
    }
  };

  const handleRegisterPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !email || selectedStandards.length === 0 || !message) {
      alert('필수 입력 항목(작성자, 이메일, 문의 규격, 내용)을 모두 채워주세요.');
      return;
    }
    if (isSecret && password.length !== 4) {
      alert('비밀글 설정 시 비밀번호는 정확히 4자리여야 합니다.');
      return;
    }

    try {
      // Supabase DB에 유연하게 저장되는 구조 (컬럼 에러 방지)
      const payload: any = {
        author,
        email,
        standards: selectedStandards.join(', '),
        employee_count: employeeCount,
        business_status: businessStatus,
        has_product_design: hasProductDesign,
        details,
        content: message,
        is_secret: isSecret,
        password: isSecret ? password : ''
      };

      const { error: dbError } = await supabase.from('inquiries').insert([payload]);

      if (dbError) {
        console.error('Supabase DB 저장 에러:', dbError);
        alert('DB 저장 오류: ' + dbError.message);
        return;
      }

      // EmailJS 메일 발송
      try {
        const templateParams = {
          author,
          email,
          standards: selectedStandards.join(', '),
          employeeCount: employeeCount || '미입력',
          businessStatus: businessStatus || '미입력',
          hasProductDesign,
          details: details || '미입력',
          message,
          to_email: 'inkman2000@naver.com'
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.warn('EmailJS 발송 오류 (DB 저장은 성공함):', emailErr);
      }

      // 목록 새로고침 및 입력창 초기화
      await fetchPosts();

      setAuthor('');
      setEmail('');
      setIsSecret(false);
      setPassword('');
      setSelectedStandards([]);
      setEmployeeCount('');
      setBusinessStatus('');
      setHasProductDesign('아니오');
      setDetails('');
      setMessage('');

      // 목록 화면으로 강제 이동
      setInquiryView('list');

      alert('상담 문의가 성공적으로 접수되었습니다.');
    } catch (error: any) {
      console.error('등록 에러:', error);
      alert('문의 등록 중 오류가 발생했습니다: ' + (error?.message || '알 수 없는 오류'));
    }
  };

  const handlePostClick = (post: InquiryPost) => {
    if (post.isSecret) {
      const inputPw = prompt('비밀글입니다. 4자리 비밀번호를 입력해주세요:');
      if (inputPw !== post.password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
    }
    setSelectedPost(post);
    setAdminReplyInput(post.reply || '');
    setInquiryView('detail');
  };

  const handleSaveReply = async (postId: string | number) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ reply: adminReplyInput })
        .eq('id', postId);

      if (error) throw error;

      await fetchPosts();
      setSelectedPost(prev => prev ? { ...prev, reply: adminReplyInput } : null);
      alert('답변이 성공적으로 등록되었습니다.');
    } catch (err: any) {
      console.error('답변 저장 오류:', err);
      alert('답변 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePost = async (postId: string | number) => {
    if (window.confirm('정말 이 문의 글을 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('inquiries')
          .delete()
          .eq('id', postId);

        if (error) throw error;

        await fetchPosts();
        if (selectedPost?.id === postId) {
          setInquiryView('list');
          setSelectedPost(null);
        }
        alert('삭제되었습니다.');
      } catch (err: any) {
        console.error('삭제 오류:', err);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin1234') {
      setIsAdminLoggedIn(true);
      alert('관리자 모드로 로그인되었습니다.');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* 헤더 */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 60px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => setActiveTab('home')}>
          <BmciLogo />
          <p style={{ fontSize: '0.65rem', color: '#64748b', margin: '4px 0 0 0', letterSpacing: '0.5px', fontWeight: '600' }}>BEST MANAGEMENT CONSULTING INSTITUTE</p>
        </div>
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('home')} style={navBtnStyle(activeTab === 'home')}>홈</button>
          <button onClick={() => setActiveTab('models')} style={navBtnStyle(activeTab === 'models')}>컨설팅 모델</button>
          <button onClick={() => setActiveTab('process')} style={navBtnStyle(activeTab === 'process')}>컨설팅 프로세스</button>
          <button onClick={() => { setActiveTab('inquiry'); setInquiryView('list'); }} style={navBtnStyle(activeTab === 'inquiry')}>고객 문의</button>
        </nav>
      </header>

      {/* 메인 */}
      <main style={{ flex: 1, padding: '50px 20px', maxWidth: '1100px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* 1. 홈 */}
        {activeTab === 'home' && (
          <div style={{ textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
            <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '8px 18px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', border: '1px solid #ffe0b2' }}>
              INTERNATIONAL LEADING AUDITOR & CONSULTING
            </span>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: '1.3', margin: 0, color: '#0f172a' }}>
              최고의 전문성과 신뢰로 완성하는<br />
              <span style={{ color: '#f28c18' }}>프리미엄 경영시스템 컨설팅</span>
            </h2>
            <p style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '750px', margin: 0, lineHeight: '1.6' }}>
              IATF 16949 및 글로벌 ISO 표준 규격에 대한 깊이 있는 통찰력과 다년간의 선임심사원 경험을 바탕으로, 기업의 지속 가능한 성장과 완벽한 인증 획득을 리드합니다.
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '25px' }}>
              <button onClick={() => setActiveTab('models')} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '14px 28px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                컨설팅 모델 보기
              </button>
              <button onClick={() => { setActiveTab('inquiry'); setInquiryView('list'); }} style={{ backgroundColor: 'transparent', color: '#0f172a', border: '2px solid #0f172a', padding: '14px 28px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>
                상담 문의하기
              </button>
            </div>
          </div>
        )}

        {/* 2. 컨설팅 모델 */}
        {activeTab === 'models' && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>컨설팅 모델</h2>
            <p style={{ color: '#64748b', marginBottom: '35px', fontSize: '1.05rem' }}>선임심사원 직영 체제로 운영되는 6대 핵심 인증 규격별 전문 가이드입니다. 규격을 클릭하여 상세 내용을 확인하세요.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
              {MODELS.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setSelectedModel(m)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: selectedModel.id === m.id ? '2px solid #f28c18' : '1px solid #e2e8f0',
                    boxShadow: selectedModel.id === m.id ? '0 10px 25px rgba(242, 140, 24, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                    padding: '24px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transform: selectedModel.id === m.id ? 'translateY(-3px)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: selectedModel.id === m.id ? '#f28c18' : '#0f172a', margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>{m.name}</h3>
                    <span style={{ fontSize: '0.75rem', backgroundColor: selectedModel.id === m.id ? '#f28c18' : '#f1f5f9', color: selectedModel.id === m.id ? '#fff' : '#64748b', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      {selectedModel.id === m.id ? '선택됨' : '상세보기'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>{m.shortDesc}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '25px' }}>
                <div>
                  <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}>
                    {selectedModel.subtitle}
                  </span>
                  <h3 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '15px 0 5px 0', fontWeight: '800' }}>{selectedModel.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0, fontWeight: '600' }}>적용 대상: {selectedModel.target}</p>
                </div>
                <button onClick={() => { setActiveTab('inquiry'); setInquiryView('write'); setSelectedStandards([selectedModel.name]); }} style={{ backgroundColor: '#f28c18', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(242,140,24,0.2)' }}>
                  이 규격 컨설팅 문의하기
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                {selectedModel.rule6thApplicability && (
                  <div style={{ backgroundColor: '#fff8f0', border: '1px solid #ffe0b2', padding: '25px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ backgroundColor: '#f28c18', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '800' }}>규칙 6판 (Rule 6th)</span>
                      <h4 style={{ fontSize: '1.2rem', color: '#e65100', margin: 0, fontWeight: '800' }}>{selectedModel.rule6thApplicability.title}</h4>
                    </div>
                    <p style={{ color: '#bf360c', fontSize: '1rem', lineHeight: '1.6', fontWeight: '600', marginBottom: '15px' }}>
                      {selectedModel.rule6thApplicability.description}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedModel.rule6thApplicability.items.map((item, idx) => (
                        <div key={idx} style={{ backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '6px', border: '1px solid #ffe0b2', color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: item.trim().startsWith('3)') || item.trim().startsWith('1)') || item.trim().startsWith('2)') ? '700' : '500' }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '10px', fontWeight: '700' }}>📋 규격 개요 및 심사원 인사이트</h4>
                  <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.1rem', margin: 0, backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f28c18' }}>
                    {selectedModel.detail}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '12px', fontWeight: '700' }}>🎯 핵심 심사 및 컨설팅 중점 포인트</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    {selectedModel.corePoints.map((pt, idx) => (
                      <div key={idx} style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#f28c18', fontWeight: '800', fontSize: '1.1rem' }}>✓</span>
                        <span style={{ color: '#334155', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.5' }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 3. 프로세스 */}
        {activeTab === 'process' && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>컨설팅 진행 단계</h2>
            <p style={{ color: '#64748b', marginBottom: '35px', fontSize: '1.05rem' }}>계약부터 최종 인증 심사 완료까지 체계적이고 투명한 7단계 프로세스입니다.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {PROCESS_STEPS.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f28c18', width: '80px', letterSpacing: '1px' }}>{p.step}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>{p.title}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 고객 문의 게시판 */}
        {activeTab === 'inquiry' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: '#0f172a' }}>고객 상담 및 문의 게시판</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '1.05rem' }}>궁금하신 사항을 남겨 주세요.</p>
              </div>
              {inquiryView === 'list' && (
                <button onClick={() => setInquiryView('write')} style={{ backgroundColor: '#f28c18', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>
                  문의 등록하기
                </button>
              )}
              {inquiryView !== 'list' && (
                <button onClick={() => setInquiryView('list')} style={{ backgroundColor: '#64748b', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>
                  목록으로 가기
                </button>
              )}
            </div>

            {/* 목록 뷰 */}
            {inquiryView === 'list' && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '0.9rem' }}>
                      <th style={{ padding: '15px' }}>번호</th>
                      <th style={{ padding: '15px' }}>문의 규격</th>
                      <th style={{ padding: '15px' }}>제목 / 내용 요약</th>
                      <th style={{ padding: '15px' }}>작성자</th>
                      <th style={{ padding: '15px' }}>작성일자</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>답변 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>등록된 문의가 없습니다.</td>
                      </tr>
                    ) : (
                      posts.map((post, idx) => (
                        <tr 
                          key={post.id} 
                          onClick={() => handlePostClick(post)} 
                          style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                        >
                          <td style={{ padding: '15px', color: '#64748b', fontWeight: '600' }}>{posts.length - idx}</td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {post.standards.map((s, sIdx) => (
                                <span key={sIdx} style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '15px', color: '#0f172a', fontWeight: '600' }}>
                            {post.isSecret ? '🔒 비밀글입니다.' : (post.message.length > 30 ? post.message.substring(0, 30) + '...' : post.message)}
                          </td>
                          <td style={{ padding: '15px', color: '#475569' }}>{post.author}</td>
                          <td style={{ padding: '15px', color: '#64748b', fontSize: '0.9rem' }}>{post.date}</td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            {post.reply ? (
                              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>답변완료</span>
                            ) : (
                              <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>대기중</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 작성 뷰 */}
            {inquiryView === 'write' && (
              <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                <form onSubmit={handleRegisterPost} style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>작성자 / 기업명 *</label>
                      <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="홍길동 / (주)OO오토모티브" style={inputStyle} required />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>회신받을 이메일 *</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@company.com" style={inputStyle} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>
                      <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#f28c18' }} />
                      비밀글 설정
                    </label>
                    {isSecret && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>비밀번호(4자리):</span>
                        <input 
                          type="password" 
                          maxLength={4} 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          placeholder="1234" 
                          style={{ width: '90px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', textAlign: 'center', fontWeight: '700' }} 
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>문의 규격 (복수 선택 가능) *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {MODELS.map(m => (
                        <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', border: '1px solid #e2e8f0' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedStandards.includes(m.name)} 
                            onChange={() => handleCheckboxChange(m.name)}
                            style={{ accentColor: '#f28c18', width: '16px', height: '16px' }}
                          />
                          <span style={{ color: selectedStandards.includes(m.name) ? '#f28c18' : '#1e293b', fontWeight: selectedStandards.includes(m.name) ? '700' : '500' }}>{m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '800' }}>📌 기업 및 제품 현황 세부 정보</h4>

                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>직원수</label>
                        <input type="text" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} placeholder="예: 50명 (본사 30명, 공장 20명)" style={inputStyle} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>제품 설계 적용 여부 *</label>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', height: '45px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>
                            <input type="radio" name="hasProductDesign" value="예" checked={hasProductDesign === '예'} onChange={() => setHasProductDesign('예')} style={{ accentColor: '#f28c18', width: '18px', height: '18px' }} />
                            예 (자체 설계 수행)
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>
                            <input type="radio" name="hasProductDesign" value="아니오" checked={hasProductDesign === '아니오'} onChange={() => setHasProductDesign('아니오')} style={{ accentColor: '#f28c18', width: '18px', height: '18px' }} />
                            아니오 (고객 시방/도면 생산)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>주요 업무 현황 (제조업일 경우 주요 제품)</label>
                      <input type="text" value={businessStatus} onChange={e => setBusinessStatus(e.target.value)} placeholder="예: 자동차 프레스 부품 제조 및 조립" style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>세부 사항</label>
                      <input type="text" value={details} onChange={e => setDetails(e.target.value)} placeholder="예: 주요 고객사, 현 인증 보유 현황, 목표 인증 일정 등" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>문의 내용 *</label>
                    <textarea 
                      rows={6} 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      placeholder="컨설팅 범위, 예상 일정, 현장 상황 등을 자유롭게 남겨주세요." 
                      style={{ ...inputStyle, resize: 'vertical' }} 
                      required 
                    />
                  </div>

                  <button type="submit" style={{ backgroundColor: '#f28c18', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '6px', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 6px rgba(242, 140, 24, 0.2)' }}>
                    상담 문의 접수하기
                  </button>

                </form>
              </div>
            )}

            {/* 상세 뷰 */}
            {inquiryView === 'detail' && selectedPost && (
              <div style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {selectedPost.standards.map((s, sIdx) => (
                        <span key={sIdx} style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>{selectedPost.author} 님의 문의 내용</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>작성일자: {selectedPost.date} | 회신 이메일: {selectedPost.email}</p>
                  </div>

                  {isAdminLoggedIn && (
                    <button onClick={() => handleDeletePost(selectedPost.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      게시글 삭제
                    </button>
                  )}
                </div>

                <div style={{ backgroundColor: '#fff8f0', padding: '20px', borderRadius: '8px', border: '1px solid #ffe0b2', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.95rem' }}>
                  <div><strong style={{ color: '#e65100' }}>• 직원수:</strong> {selectedPost.employeeCount || '미입력'}</div>
                  <div><strong style={{ color: '#e65100' }}>• 제품 설계 적용 여부:</strong> {selectedPost.hasProductDesign || '아니오'}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong style={{ color: '#e65100' }}>• 주요 업무 현황:</strong> {selectedPost.businessStatus || '미입력'}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong style={{ color: '#e65100' }}>• 세부 사항:</strong> {selectedPost.details || '미입력'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedPost.message}
                </div>

                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>관리자 컨설팅 답변</h4>
                  {isAdminLoggedIn ? (
                    <>
                      <textarea 
                        rows={4} 
                        value={adminReplyInput} 
                        onChange={e => setAdminReplyInput(e.target.value)} 
                        placeholder="선임심사원로서의 전문적인 답변 및 안내 사항을 입력하세요." 
                        style={{ ...inputStyle, resize: 'vertical' }} 
                      />
                      <button 
                        onClick={() => handleSaveReply(selectedPost.id)} 
                        style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end' }}
                      >
                        답변 등록 및 저장
                      </button>
                    </>
                  ) : (
                    <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '6px', color: '#334155', minHeight: '60px' }}>
                      {selectedPost.reply || '아직 등록된 답변이 없습니다. (관리자 로그인 후 답변 작성 가능)'}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* 5. 관리자 */}
        {activeTab === 'admin' && (
          <div style={{ maxWidth: '600px', margin: '40px auto' }}>
            {!isAdminLoggedIn ? (
              <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>관리자 인증</h2>
                <p style={{ color: '#64748b', marginBottom: '25px' }}>관리자 전용 기능을 이용하려면 비밀번호를 입력하세요.</p>
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input 
                    type="password" 
                    value={adminPasswordInput} 
                    onChange={e => setAdminPasswordInput(e.target.value)} 
                    placeholder="관리자 비밀번호 입력" 
                    style={inputStyle} 
                    required 
                  />
                  <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>
                    관리자 로그인
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                  관리자 권한 활성화됨
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '15px 0 10px 0' }}>BMCI 관리자 대시보드</h2>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>고객 문의 게시판에서 글을 클릭하여 상세 답변을 작성하거나 삭제할 수 있습니다.</p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button onClick={() => { setActiveTab('inquiry'); setInquiryView('list'); }} style={{ backgroundColor: '#f28c18', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                    문의 게시판 관리로 이동
                  </button>
                  <button onClick={() => setIsAdminLoggedIn(false)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 푸터 */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <BmciLogo scale={0.8} />
          <p style={{ margin: 0, color: '#94a3b8' }}>© 2026 BMCI. All rights reserved.</p>
        </div>
        <button 
          onClick={() => setActiveTab('admin')} 
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
        >
          관리자 모드
        </button>
      </footer>
    </div>
  );
}

function isActiveStyle(active: boolean) {
  return {
    backgroundColor: 'transparent',
    border: 'none',
    color: active ? '#f28c18' : '#64748b',
    fontSize: '1.05rem',
    fontWeight: active ? '800' : '600',
    cursor: 'pointer',
    padding: '8px 0',
    borderBottom: active ? '2px solid #f28c18' : '2px solid transparent',
    transition: 'all 0.2s'
  };
}

const navBtnStyle = (active: boolean) => isActiveStyle(active);

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontSize: '1rem',
  outline: 'none'
};
