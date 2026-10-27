import React, { useState, useEffect, useRef } from 'react';
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

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'hwp'];
const MAX_FILE_SIZE_MB = 10;

// 금액 숫자를 한글 금액으로 변환하는 함수 (예: 1250000 -> 일백이십오만)
function numberToKoreanAmount(num: number): string {
  if (!num || isNaN(num) || num <= 0) return '영';
  const units = ['', '만', '억', '조'];
  const smallUnits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const tens = ['', '십', '백', '천'];

  let result = '';
  let unitIndex = 0;

  while (num > 0) {
    const chunk = num % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      const chunkDigits = chunk.toString().padStart(4, '0');
      for (let i = 0; i < 4; i++) {
        const digit = parseInt(chunkDigits[i], 10);
        if (digit > 0) {
          chunkStr += smallUnits[digit] + tens[3 - i];
        }
      }
      result = chunkStr + units[unitIndex] + ' ' + result;
    }
    num = Math.floor(num / 10000);
    unitIndex++;
  }
  return result.trim();
}

interface InquiryPost {
  id: string | number;
  date: string;
  author: string;          // 통합 or 하위호환
  companyName?: string;    // 고객명(회사명)
  managerName?: string;    // 담당자
  email: string;           // 회신받을 이메일
  phone?: string;          // 연락처
  isSecret: boolean;
  password?: string;
  standards: string[];
  employeeCount?: string;
  businessStatus?: string;
  hasProductDesign?: string;
  details?: string;
  message: string;
  reply?: string;
  fileUrl?: string;
  fileName?: string;
}

// 견적서 품목 인터페이스
interface EstimateItem {
  id: string;
  name: string;        // 품명
  spec: string;        // 규격
  quantity: number;    // 수량
  unitPrice: number;   // 단가
  note: string;        // 비고
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
  // ✅ 탭 유지: localStorage 연동
  const [activeTab, setActiveTab] = useState<'home' | 'models' | 'process' | 'inquiry' | 'admin'>(() => {
    const saved = localStorage.getItem('bmci_active_tab');
    const validTabs = ['home', 'models', 'process', 'inquiry'];
    return (validTabs.includes(saved || '') ? saved : 'home') as 'home' | 'models' | 'process' | 'inquiry' | 'admin';
  });
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);

  const [posts, setPosts] = useState<InquiryPost[]>([]);

  useEffect(() => {
    if (activeTab !== 'admin') {
      localStorage.setItem('bmci_active_tab', activeTab);
    }
  }, [activeTab]);

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
          author: item.author || item.company_name || '익명',
          companyName: item.company_name || (item.author ? item.author.split('/')[0].trim() : ''),
          managerName: item.manager_name || (item.author && item.author.includes('/') ? item.author.split('/')[1]?.trim() : ''),
          email: item.email || '',
          phone: item.phone || '',
          isSecret: item.is_secret || false,
          password: item.password || '',
          standards: item.standards ? item.standards.split(',').map((s: string) => s.trim()) : [],
          employeeCount: item.employee_count || '',
          businessStatus: item.business_status || '',
          hasProductDesign: typeof item.has_product_design === 'boolean' ? (item.has_product_design ? '예' : '아니오') : (item.has_product_design || '아니오'),
          details: item.details || '',
          message: item.content || item.message || '',
          reply: item.reply || '',
          fileUrl: item.file_url || '',
          fileName: item.file_name || '',
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

  // 📝 수정된 고객문의 입력 폼 상태
  const [companyName, setCompanyName] = useState(''); // 고객명(회사명)
  const [managerName, setManagerName] = useState(''); // 담당자
  const [email, setEmail] = useState('');             // 회신받을 이메일
  const [phone, setPhone] = useState('');             // 연락처
  const [isSecret, setIsSecret] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [employeeCount, setEmployeeCount] = useState('');
  const [businessStatus, setBusinessStatus] = useState('');
  const [hasProductDesign, setHasProductDesign] = useState<'예' | '아니오'>('아니오');
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState('');

  // 파일 업로드 상태
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔐 관리자 인증 및 비번 변경 상태
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('bmci_admin_pwd') || 'admin1234';
  });
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  // 📑 견적서 관리자 상태
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'estimate'>('dashboard');
  
  // 견적서 정보 상태
  const [estimateClient, setEstimateClient] = useState({
    companyName: '',
    manager: '',
    tel: '',
    email: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([
    { id: '1', name: 'IATF 16949 경영시스템 컨설팅', spec: '인증 컨설팅 및 교육', quantity: 1, unitPrice: 5000000, note: '' },
    { id: '2', name: '내부심사원 양성 교육', spec: '실무 심사원 교육 (2일)', quantity: 1, unitPrice: 1200000, note: '' }
  ]);

  const [negotiationDiscount, setNegotiationDiscount] = useState<number>(0); // 네고(할인) 항목
  const [estimateSpecialNote, setEstimateSpecialNote] = useState('유효기간은 발행일로부터 30일 입니다.');

  // 체크박스 선택
  const handleCheckboxChange = (stdName: string) => {
    if (selectedStandards.includes(stdName)) {
      setSelectedStandards(selectedStandards.filter(s => s !== stdName));
    } else {
      setSelectedStandards([...selectedStandards, stdName]);
    }
  };

  // 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`허용되지 않는 파일 형식입니다.\n업로드 가능: ${ALLOWED_EXTENSIONS.join(', ')}`);
      e.target.value = '';
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      alert(`파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE_MB}MB)\n현재 파일: ${sizeMB.toFixed(1)}MB`);
      e.target.value = '';
      return;
    }

    setAttachedFile(file);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 고객 문의 등록
  const handleRegisterPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !managerName.trim() || !email.trim() || selectedStandards.length === 0 || !message.trim()) {
      alert('필수 입력 항목(고객명, 담당자, 이메일, 문의 규격, 내용)을 모두 채워주세요.');
      return;
    }
    if (isSecret && password.length !== 4) {
      alert('비밀글 설정 시 비밀번호는 정확히 4자리여야 합니다.');
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl = '';
      let fileName = '';

      if (attachedFile) {
        const ext = attachedFile.name.split('.').pop()?.toLowerCase() || '';
        const uniquePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inquiry-files')
          .upload(uniquePath, attachedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('스토리지 업로드 경고:', uploadError);
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('inquiry-files')
            .getPublicUrl(uploadData.path);
          fileUrl = urlData.publicUrl;
          fileName = attachedFile.name;
        }
      }

      // 통합 작성자 이름 (기존 호환: "고객명 / 담당자")
      const authorCombined = `${companyName.trim()} / ${managerName.trim()}`;

      const payload: any = {
        author: authorCombined,
        company_name: companyName.trim(),
        manager_name: managerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        standards: selectedStandards.join(', '),
        employee_count: employeeCount,
        business_status: businessStatus,
        has_product_design: hasProductDesign,
        details,
        content: message,
        is_secret: isSecret,
        password: isSecret ? password : '',
        file_url: fileUrl,
        file_name: fileName,
      };

      const { error: dbError } = await supabase.from('inquiries').insert([payload]);

      if (dbError) {
        // 만약 company_name 등 신규 컬럼이 아직 DB에 없을 경우 기본 author/email 컬럼으로 fallback 저장
        console.warn('확장 컬럼 저장 재시도(fallback):', dbError);
        const fallbackPayload = {
          author: `${authorCombined} (연락처: ${phone})`,
          email: email.trim(),
          standards: selectedStandards.join(', '),
          employee_count: employeeCount,
          business_status: businessStatus,
          has_product_design: hasProductDesign,
          details: `연락처: ${phone} | ${details}`,
          content: message,
          is_secret: isSecret,
          password: isSecret ? password : '',
          file_url: fileUrl,
          file_name: fileName,
        };
        const { error: fbErr } = await supabase.from('inquiries').insert([fallbackPayload]);
        if (fbErr) {
          throw fbErr;
        }
      }

      // EmailJS 전송
      try {
        const templateParams = {
          author: authorCombined,
          companyName,
          managerName,
          phone,
          email,
          standards: selectedStandards.join(', '),
          employeeCount: employeeCount || '미입력',
          businessStatus: businessStatus || '미입력',
          hasProductDesign,
          details: details || '미입력',
          message,
          attachedFileName: fileName || '첨부파일 없음',
          to_email: 'inkman2000@naver.com'
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.warn('EmailJS 발송 오류:', emailErr);
      }

      await fetchPosts();

      setCompanyName('');
      setManagerName('');
      setEmail('');
      setPhone('');
      setIsSecret(false);
      setPassword('');
      setSelectedStandards([]);
      setEmployeeCount('');
      setBusinessStatus('');
      setHasProductDesign('아니오');
      setDetails('');
      setMessage('');
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setInquiryView('list');
      alert('상담 문의가 성공적으로 접수되었습니다.');
    } catch (error: any) {
      console.error('등록 에러:', error);
      alert('문의 등록 중 오류가 발생했습니다: ' + (error?.message || '알 수 없는 오류'));
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostClick = (post: InquiryPost) => {
    if (post.isSecret && !isAdminLoggedIn) {
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
        const targetPost = posts.find(p => p.id === postId);
        if (targetPost?.fileUrl) {
          const pathMatch = targetPost.fileUrl.match(/inquiry-files\/(.+)$/);
          if (pathMatch) {
            await supabase.storage.from('inquiry-files').remove([pathMatch[1]]);
          }
        }

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

  // 🔑 관리자 로그인
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === adminPassword) {
      setIsAdminLoggedIn(true);
      alert('관리자 모드로 로그인되었습니다.');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  // 🔑 관리자 비밀번호 변경
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setAdminPassword(newAdminPassword);
    localStorage.setItem('bmci_admin_pwd', newAdminPassword);
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    alert('관리자 비밀번호가 성공적으로 변경되었습니다!');
  };

  // 📑 특정 고객 문의로 견적서 작성 화면으로 이동 및 연동
  const handleOpenEstimateFromPost = (post: InquiryPost) => {
    const cName = post.companyName || post.author.split('/')[0].trim();
    const mName = post.managerName || (post.author.includes('/') ? post.author.split('/')[1]?.trim() : '');

    setEstimateClient({
      companyName: cName,
      manager: mName,
      tel: post.phone || '',
      email: post.email || '',
      date: new Date().toISOString().split('T')[0]
    });

    // 문의 규격에 맞춰 기본 품목 자동 세팅
    if (post.standards && post.standards.length > 0) {
      const generatedItems: EstimateItem[] = post.standards.map((std, idx) => ({
        id: String(idx + 1),
        name: `${std} 경영시스템 컨설팅`,
        spec: '시스템 구축 및 인증 지도',
        quantity: 1,
        unitPrice: std.includes('16949') ? 6000000 : 4000000,
        note: ''
      }));
      setEstimateItems(generatedItems);
    }

    setActiveTab('admin');
    setAdminViewMode('estimate');
  };

  // 견적서 품목 핸들러
  const handleItemChange = (index: number, field: keyof EstimateItem, value: any) => {
    const updated = [...estimateItems];
    updated[index] = { ...updated[index], [field]: value };
    setEstimateItems(updated);
  };

  const handleAddItem = () => {
    setEstimateItems([
      ...estimateItems,
      { id: Date.now().toString(), name: '', spec: '', quantity: 1, unitPrice: 0, note: '' }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (estimateItems.length <= 1) {
      alert('최소 1개 이상의 품목이 필요합니다.');
      return;
    }
    setEstimateItems(estimateItems.filter((_, i) => i !== index));
  };

  // 금액 계산
  const subTotal = estimateItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
  const totalAmount = Math.max(0, subTotal - (Number(negotiationDiscount) || 0));

  // 인쇄 실행
  const handlePrintEstimate = () => {
    window.print();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📑';
    if (ext === 'zip') return '🗜️';
    if (ext === 'hwp') return '📃';
    return '📎';
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* 🖨️ 인쇄 전용 스타일 태그 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-estimate-area, #printable-estimate-area * {
            visibility: visible;
          }
          #printable-estimate-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* 헤더 */}
      <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 60px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
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
                      <th style={{ padding: '15px' }}>고객명 / 담당자</th>
                      <th style={{ padding: '15px' }}>작성일자</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>첨부</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>답변 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>등록된 문의가 없습니다.</td>
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
                          <td style={{ padding: '15px', color: '#475569' }}>
                            {post.companyName ? `${post.companyName} (${post.managerName || '-'})` : post.author}
                          </td>
                          <td style={{ padding: '15px', color: '#64748b', fontSize: '0.9rem' }}>{post.date}</td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            {post.fileUrl ? (
                              <span title={post.fileName} style={{ fontSize: '1.2rem' }}>{getFileIcon(post.fileName || '')}</span>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
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

            {/* 작성 뷰: 고객명, 담당자, 이메일, 연락처 분리 완료 */}
            {inquiryView === 'write' && (
              <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                <form onSubmit={handleRegisterPost} style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  
                  {/* 요청하신 입력 항목: 고객명, 담당자, 이메일, 연락처 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>고객명 (기업명) *</label>
                      <input 
                        type="text" 
                        value={companyName} 
                        onChange={e => setCompanyName(e.target.value)} 
                        placeholder="(주)한국오토모티브" 
                        style={inputStyle} 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>담당자 (성함) *</label>
                      <input 
                        type="text" 
                        value={managerName} 
                        onChange={e => setManagerName(e.target.value)} 
                        placeholder="홍길동 팀장" 
                        style={inputStyle} 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>회신받을 이메일 *</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="example@company.com" 
                        style={inputStyle} 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>연락처 (TEL)</label>
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        placeholder="010-1234-5678 or 041-000-0000" 
                        style={inputStyle} 
                      />
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

                  {/* 파일 업로드 섹션 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700' }}>
                      📎 첨부파일 업로드 <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>(선택 · 최대 10MB)</span>
                    </label>

                    {!attachedFile && (
                      <label
                        htmlFor="fileUploadInput"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '28px 20px',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: '#f8fafc',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#f28c18')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                      >
                        <span style={{ fontSize: '2rem' }}>📁</span>
                        <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>클릭하여 파일 선택</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, ZIP, HWP 허용
                        </span>
                      </label>
                    )}

                    <input
                      id="fileUploadInput"
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.hwp"
                      style={{ display: 'none' }}
                    />

                    {attachedFile && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 18px',
                        backgroundColor: '#fff8f0',
                        border: '1px solid #ffe0b2',
                        borderRadius: '8px',
                      }}>
                        <span style={{ fontSize: '1.8rem' }}>{getFileIcon(attachedFile.name)}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{attachedFile.name}</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                            {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                        >
                          제거
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    style={{
                      backgroundColor: isUploading ? '#94a3b8' : '#f28c18',
                      color: '#ffffff',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '1.05rem',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      marginTop: '10px',
                      boxShadow: '0 4px 6px rgba(242, 140, 24, 0.2)',
                    }}
                  >
                    {isUploading ? '업로드 및 접수 진행 중...' : '상담 문의 접수하기'}
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
                    <h3 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>
                      {selectedPost.companyName || selectedPost.author} 님의 문의 내용
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                      작성일자: {selectedPost.date} | 담당자: {selectedPost.managerName || '미입력'} | 연락처: {selectedPost.phone || '미입력'} | 회신 이메일: {selectedPost.email}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* 🚀 관리자: 이 고객 문의로 바로 견적서 작성 이동 */}
                    {isAdminLoggedIn && (
                      <button 
                        onClick={() => handleOpenEstimateFromPost(selectedPost)} 
                        style={{ backgroundColor: '#f28c18', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        📑 견적서 작성
                      </button>
                    )}
                    {isAdminLoggedIn && (
                      <button onClick={() => handleDeletePost(selectedPost.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff8f0', padding: '20px', borderRadius: '8px', border: '1px solid #ffe0b2', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.95rem' }}>
                  <div><strong style={{ color: '#e65100' }}>• 고객사명:</strong> {selectedPost.companyName || selectedPost.author}</div>
                  <div><strong style={{ color: '#e65100' }}>• 담당자:</strong> {selectedPost.managerName || '미입력'}</div>
                  <div><strong style={{ color: '#e65100' }}>• 연락처:</strong> {selectedPost.phone || '미입력'}</div>
                  <div><strong style={{ color: '#e65100' }}>• 직원수:</strong> {selectedPost.employeeCount || '미입력'}</div>
                  <div><strong style={{ color: '#e65100' }}>• 제품 설계 적용 여부:</strong> {selectedPost.hasProductDesign || '아니오'}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong style={{ color: '#e65100' }}>• 주요 업무 현황:</strong> {selectedPost.businessStatus || '미입력'}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong style={{ color: '#e65100' }}>• 세부 사항:</strong> {selectedPost.details || '미입력'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedPost.message}
                </div>

                {selectedPost.fileUrl && selectedPost.fileName && (
                  <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: '700', color: '#0369a1', fontSize: '0.95rem' }}>📎 첨부파일</p>
                    
                    {isImageFile(selectedPost.fileName) && (
                      <img
                        src={selectedPost.fileUrl}
                        alt="첨부 이미지"
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e0f2fe', marginBottom: '10px', display: 'block' }}
                      />
                    )}

                    <a
                      href={selectedPost.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={selectedPost.fileName}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#0369a1', color: '#ffffff', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none' }}
                    >
                      {getFileIcon(selectedPost.fileName)} {selectedPost.fileName} 다운로드
                    </a>
                  </div>
                )}

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

        {/* 5. 관리자 페이지 (비밀번호 변경 및 견적서 출력 기능) */}
        {activeTab === 'admin' && (
          <div>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '500px', margin: '40px auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', textAlign: 'center' }}>
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
              <div>
                {/* 관리자 상단 바 */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '15px 25px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                      관리자 모드 접속 중
                    </span>
                    <button 
                      onClick={() => setAdminViewMode('dashboard')} 
                      style={{ ...tabToggleBtn(adminViewMode === 'dashboard') }}
                    >
                      ⚙️ 관리자 대시보드 (비번 변경)
                    </button>
                    <button 
                      onClick={() => setAdminViewMode('estimate')} 
                      style={{ ...tabToggleBtn(adminViewMode === 'estimate') }}
                    >
                      📄 견적서 작성 & PDF 인쇄
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setActiveTab('inquiry'); setInquiryView('list'); }} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                      게시판으로 이동
                    </button>
                    <button onClick={() => setIsAdminLoggedIn(false)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                      로그아웃
                    </button>
                  </div>
                </div>

                {/* 5-1. 관리자 대시보드 (비밀번호 변경 등) */}
                {adminViewMode === 'dashboard' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    
                    {/* 비밀번호 변경 폼 */}
                    <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>🔐 관리자 비밀번호 변경</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>새로운 관리자 비밀번호를 설정할 수 있습니다.</p>
                      
                      <form onSubmit={handleChangeAdminPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>새 비밀번호</label>
                          <input 
                            type="password" 
                            value={newAdminPassword} 
                            onChange={e => setNewAdminPassword(e.target.value)} 
                            placeholder="새 비밀번호 입력" 
                            style={inputStyle} 
                            required 
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>새 비밀번호 확인</label>
                          <input 
                            type="password" 
                            value={confirmAdminPassword} 
                            onChange={e => setConfirmAdminPassword(e.target.value)} 
                            placeholder="새 비밀번호 다시 입력" 
                            style={inputStyle} 
                            required 
                          />
                        </div>
                        <button type="submit" style={{ backgroundColor: '#f28c18', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>
                          비밀번호 변경 완료
                        </button>
                      </form>
                    </div>

                    {/* 빠른 작업 안내 */}
                    <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>🚀 견적서 및 문의글 관리</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>고객이 남긴 상담글을 기반으로 손쉽게 공식 견적서를 작성할 수 있습니다.</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ backgroundColor: '#fff8f0', padding: '15px', borderRadius: '6px', border: '1px solid #ffe0b2', fontSize: '0.95rem' }}>
                          <strong>• 최근 접수된 문의:</strong> {posts.length}건
                        </div>
                        <button 
                          onClick={() => setAdminViewMode('estimate')} 
                          style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}
                        >
                          새 견적서 작성 화면으로 이동
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* 5-2. 견적서 작성 및 PDF 인쇄 뷰 (요청하신 양식 100% 반영) */}
                {adminViewMode === 'estimate' && (
                  <div>
                    {/* 상단 컨트롤러 (인쇄 시 숨김) */}
                    <div className="no-print" style={{ backgroundColor: '#ffffff', padding: '20px 25px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>공식 견적서 작성 & PDF 출력</h3>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>아래 표에서 직접 수정 후 [PDF 출력 / 인쇄] 버튼을 누르면 A4 규격으로 출력됩니다.</p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={handleAddItem} 
                          style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          + 품목 추가
                        </button>
                        <button 
                          onClick={handlePrintEstimate} 
                          style={{ backgroundColor: '#f28c18', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px rgba(242,140,24,0.3)' }}
                        >
                          🖨️ PDF 출력 / 인쇄
                        </button>
                      </div>
                    </div>

                    {/* 🖨️ 인쇄될 견적서 영역 (첨부 이미지 양식 정확 일치) */}
                    <div 
                      id="printable-estimate-area" 
                      style={{ 
                        backgroundColor: '#ffffff', 
                        padding: '30px 40px', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '4px', 
                        maxWidth: '850px', 
                        margin: '0 auto', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        color: '#000000',
                        fontFamily: '"Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Regular, sans-serif'
                      }}
                    >
                      {/* 타이틀 */}
                      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <h1 style={{ fontSize: '2.4rem', letterSpacing: '18px', margin: 0, fontWeight: '900', borderBottom: '2px solid #000', display: 'inline-block', paddingBottom: '4px' }}>
                          견 적 서
                        </h1>
                      </div>

                      {/* 상단 2열 정보: 좌측 공급받는 자 / 우측 공급자 정보 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '45% 55%', gap: '15px', marginBottom: '15px' }}>
                        
                        {/* 공급받는 자 (좌측) */}
                        <div style={{ border: '2px solid #000', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '80px', fontWeight: '700', fontSize: '0.95rem' }}>업 체 명 :</span>
                            <input 
                              type="text" 
                              value={estimateClient.companyName} 
                              onChange={e => setEstimateClient({ ...estimateClient, companyName: e.target.value })} 
                              style={estimateInputStyle} 
                              placeholder="업체명 입력"
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '80px', fontWeight: '700', fontSize: '0.95rem' }}>담 당 :</span>
                            <input 
                              type="text" 
                              value={estimateClient.manager} 
                              onChange={e => setEstimateClient({ ...estimateClient, manager: e.target.value })} 
                              style={estimateInputStyle} 
                              placeholder="담당자명 입력"
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '80px', fontWeight: '700', fontSize: '0.95rem' }}>TEL. :</span>
                            <input 
                              type="text" 
                              value={estimateClient.tel} 
                              onChange={e => setEstimateClient({ ...estimateClient, tel: e.target.value })} 
                              style={estimateInputStyle} 
                              placeholder="연락처 입력"
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '80px', fontWeight: '700', fontSize: '0.95rem' }}>e-mail :</span>
                            <input 
                              type="text" 
                              value={estimateClient.email} 
                              onChange={e => setEstimateClient({ ...estimateClient, email: e.target.value })} 
                              style={estimateInputStyle} 
                              placeholder="이메일 입력"
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '80px', fontWeight: '700', fontSize: '0.95rem' }}>견적일자 :</span>
                            <input 
                              type="text" 
                              value={estimateClient.date} 
                              onChange={e => setEstimateClient({ ...estimateClient, date: e.target.value })} 
                              style={estimateInputStyle} 
                            />
                          </div>
                        </div>

                        {/* 공급자 정보 (우측 - 첨부 이미지와 정확히 동일) */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', textAlign: 'center', fontSize: '0.88rem' }}>
                          <tbody>
                            <tr>
                              <td rowSpan={4} style={{ width: '28px', borderRight: '1px solid #000', fontWeight: '700', padding: '4px', backgroundColor: '#fafafa' }}>공<br/>급<br/>자</td>
                              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px 4px', fontWeight: '700', width: '65px' }}>등록번호</td>
                              <td colSpan={3} style={{ borderBottom: '1px solid #000', padding: '6px', fontWeight: '800', fontSize: '1rem', letterSpacing: '2px' }}>
                                313-66-00033
                              </td>
                            </tr>
                            <tr>
                              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px 4px', fontWeight: '700' }}>상 호</td>
                              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px', fontWeight: '800' }}>비엠씨아이</td>
                              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px 4px', fontWeight: '700', width: '45px' }}>대 표</td>
                              <td style={{ borderBottom: '1px solid #000', padding: '6px', fontWeight: '800' }}>
                                강 병 수 <span style={{ color: '#dc2626', fontWeight: '900', border: '1px solid #dc2626', borderRadius: '50%', padding: '1px 3px', fontSize: '0.75rem', marginLeft: '4px' }}>인</span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px 4px', fontWeight: '700' }}>주 소</td>
                              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px', fontSize: '0.8rem' }}>충남 아산시 배방로<br/>105번길 31</td>
                              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px 4px', fontWeight: '700' }}>TEL</td>
                              <td style={{ borderBottom: '1px solid #000', padding: '6px', fontSize: '0.85rem' }}>041)910-2057</td>
                            </tr>
                            <tr>
                              <td style={{ borderRight: '1px solid #000', padding: '6px 4px', fontWeight: '700' }}>업 태</td>
                              <td style={{ borderRight: '1px solid #000', padding: '6px' }}>서비스</td>
                              <td style={{ borderRight: '1px solid #000', padding: '6px 4px', fontWeight: '700' }}>종 목</td>
                              <td style={{ padding: '6px' }}>경영컨설팅</td>
                            </tr>
                          </tbody>
                        </table>

                      </div>

                      {/* 안내 문구 */}
                      <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: '700', margin: '14px 0', letterSpacing: '1px' }}>
                        아 래 와 &nbsp; 같 이 &nbsp; 견 적 &nbsp; 드 리 오 니 &nbsp; 검 토 &nbsp; 바 랍 니 다 .
                      </div>

                      {/* 합계금액 바 */}
                      <div style={{ border: '2px solid #000', padding: '10px 16px', fontSize: '1.05rem', fontWeight: '800', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', backgroundColor: '#fcfcfc' }}>
                        <div>
                          합계금액 : 일금 &nbsp; <span style={{ textDecoration: 'underline', color: '#000000', fontWeight: '900' }}>{numberToKoreanAmount(totalAmount)}</span> &nbsp; 원정
                        </div>
                        <div>
                          (₩ {totalAmount.toLocaleString()} 원) - <span style={{ color: '#000' }}>VAT별도</span>
                        </div>
                      </div>

                      {/* 견적서 품목 테이블 */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', textAlign: 'center', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #000', backgroundColor: '#f8f8f8', fontWeight: '800' }}>
                            <th style={{ width: '45px', borderRight: '1px solid #000', padding: '8px 4px' }}>NO</th>
                            <th style={{ borderRight: '1px solid #000', padding: '8px' }}>품 &nbsp; 명</th>
                            <th style={{ width: '150px', borderRight: '1px solid #000', padding: '8px' }}>규 &nbsp; 격</th>
                            <th style={{ width: '55px', borderRight: '1px solid #000', padding: '8px' }}>수 량</th>
                            <th style={{ width: '110px', borderRight: '1px solid #000', padding: '8px' }}>단 &nbsp; 가</th>
                            <th style={{ width: '120px', borderRight: '1px solid #000', padding: '8px' }}>금 &nbsp; 액</th>
                            <th style={{ width: '80px', padding: '8px' }}>비 &nbsp; 고</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estimateItems.map((item, index) => {
                            const amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                            return (
                              <tr key={item.id} style={{ borderBottom: '1px solid #000' }}>
                                <td style={{ borderRight: '1px solid #000', padding: '8px 4px', fontWeight: '600' }}>
                                  {index + 1}
                                </td>
                                <td style={{ borderRight: '1px solid #000', padding: '4px' }}>
                                  <input 
                                    type="text" 
                                    value={item.name} 
                                    onChange={e => handleItemChange(index, 'name', e.target.value)} 
                                    style={{ ...tableInputStyle, textAlign: 'left', fontWeight: '600' }} 
                                    placeholder="품명"
                                  />
                                </td>
                                <td style={{ borderRight: '1px solid #000', padding: '4px' }}>
                                  <input 
                                    type="text" 
                                    value={item.spec} 
                                    onChange={e => handleItemChange(index, 'spec', e.target.value)} 
                                    style={tableInputStyle} 
                                    placeholder="규격/내용"
                                  />
                                </td>
                                <td style={{ borderRight: '1px solid #000', padding: '4px' }}>
                                  <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} 
                                    style={{ ...tableInputStyle, textAlign: 'center' }} 
                                  />
                                </td>
                                <td style={{ borderRight: '1px solid #000', padding: '4px' }}>
                                  <input 
                                    type="number" 
                                    value={item.unitPrice} 
                                    onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} 
                                    style={{ ...tableInputStyle, textAlign: 'right' }} 
                                  />
                                </td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: '700' }}>
                                  {amount.toLocaleString()}
                                </td>
                                <td style={{ padding: '4px', position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    value={item.note} 
                                    onChange={e => handleItemChange(index, 'note', e.target.value)} 
                                    style={tableInputStyle} 
                                  />
                                  {estimateItems.length > 1 && (
                                    <button 
                                      className="no-print" 
                                      onClick={() => handleRemoveItem(index)}
                                      style={{ position: 'absolute', right: '-25px', top: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                                      title="품목 삭제"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                          {/* 요청하신 네고(할인) 항목 */}
                          <tr style={{ borderBottom: '1px solid #000', backgroundColor: '#fffbf5' }}>
                            <td style={{ borderRight: '1px solid #000', padding: '8px 4px', fontWeight: '700', color: '#c2410c' }}>네고</td>
                            <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: '700', color: '#c2410c' }}>
                              특별 할인 / 네고 반영
                            </td>
                            <td style={{ borderRight: '1px solid #000', padding: '8px' }}>DC</td>
                            <td style={{ borderRight: '1px solid #000', padding: '8px' }}>1</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px' }}>
                              <input 
                                type="number" 
                                value={negotiationDiscount} 
                                onChange={e => setNegotiationDiscount(Number(e.target.value))} 
                                style={{ ...tableInputStyle, textAlign: 'right', color: '#c2410c', fontWeight: '700' }} 
                                placeholder="할인 금액"
                              />
                            </td>
                            <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right', color: '#c2410c', fontWeight: '800' }}>
                              -{Number(negotiationDiscount).toLocaleString()}
                            </td>
                            <td style={{ padding: '8px', fontSize: '0.8rem', color: '#c2410c' }}>네고적용</td>
                          </tr>

                          {/* 양식상 여백을 채워주는 빈 행들 (실제 출력시 A4 양식 미려하게 유지) */}
                          {Array.from({ length: Math.max(0, 7 - estimateItems.length) }).map((_, i) => (
                            <tr key={`empty_${i}`} style={{ borderBottom: '1px solid #000', height: '34px' }}>
                              <td style={{ borderRight: '1px solid #000' }}></td>
                              <td style={{ borderRight: '1px solid #000' }}></td>
                              <td style={{ borderRight: '1px solid #000' }}></td>
                              <td style={{ borderRight: '1px solid #000' }}></td>
                              <td style={{ borderRight: '1px solid #000' }}></td>
                              <td style={{ borderRight: '1px solid #000' }}></td>
                              <td></td>
                            </tr>
                          ))}

                          {/* 맨 아래 자동 합계 행 */}
                          <tr style={{ backgroundColor: '#f5f5f5', fontWeight: '900', borderTop: '2px solid #000', height: '40px' }}>
                            <td colSpan={2} style={{ borderRight: '1px solid #000', letterSpacing: '10px', textAlign: 'center', fontSize: '1rem' }}>
                              합 &nbsp; 계
                            </td>
                            <td style={{ borderRight: '1px solid #000' }}>-</td>
                            <td style={{ borderRight: '1px solid #000' }}>-</td>
                            <td style={{ borderRight: '1px solid #000' }}>-</td>
                            <td style={{ borderRight: '1px solid #000', textAlign: 'right', padding: '8px', fontSize: '1.1rem', color: '#000' }}>
                              {totalAmount.toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 하단 특기사항 영역 */}
                      <div style={{ border: '2px solid #000', borderTop: 'none', padding: '16px 20px', marginTop: '0' }}>
                        <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '8px', marginBottom: '10px' }}>
                          특 &nbsp; 기 &nbsp; 사 &nbsp; 항
                        </div>
                        <textarea 
                          rows={3} 
                          value={estimateSpecialNote} 
                          onChange={e => setEstimateSpecialNote(e.target.value)} 
                          style={{ width: '100%', border: 'none', outline: 'none', resize: 'vertical', fontSize: '0.95rem', lineHeight: '1.6', fontFamily: 'inherit', backgroundColor: 'transparent' }} 
                        />
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </main>

      {/* 푸터 */}
      <footer className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
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

const tabToggleBtn = (active: boolean) => ({
  backgroundColor: active ? '#f28c18' : '#f1f5f9',
  color: active ? '#ffffff' : '#334155',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontWeight: '700',
  fontSize: '0.88rem',
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontSize: '1rem',
  outline: 'none'
};

const estimateInputStyle = {
  flex: 1,
  border: 'none',
  borderBottom: '1px solid #cbd5e1',
  padding: '3px 6px',
  fontSize: '0.92rem',
  outline: 'none',
  fontFamily: 'inherit'
};

const tableInputStyle = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '4px',
  fontSize: '0.9rem',
  fontFamily: 'inherit'
};
