import { useEffect, useState } from "react";
import {
  Camera,
  Trash2,
  Plus,
  X,
  Check,
  MapPin,
  Store,
  LayoutGrid,
  Phone,
  Link2,
  FileText,
  Gift,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { ApiError } from "../../api/client";
import {
  createBenefit,
  createPlaceImage,
  deleteBenefit,
  deletePlaceImage,
  getBenefits,
  getPlace,
  updateBenefit,
  updatePlace,
  updatePlaceImage,
  type Benefit,
  type PlaceDetail,
  type PlaceImageSummary,
} from "../../api/place";
import "./PlaceManagePage.css";

export default function PlaceManagePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", homepage: "", overview: "" });
  const [saving, setSaving] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [images, setImages] = useState<PlaceImageSummary[]>([]);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [photoUrlDraft, setPhotoUrlDraft] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    Promise.all([getPlace(), getBenefits()])
      .then(([placeRes, benefitsRes]) => {
        setPlace(placeRes);
        setForm({
          name: placeRes.name,
          phone: placeRes.phone ?? "",
          homepage: placeRes.homepage ?? "",
          overview: placeRes.overview ?? "",
        });
        setImages(placeRes.images);
        setBenefits(benefitsRes.items.filter((b) => b.isActive));
      })
      .catch((err) => showToast(err instanceof ApiError ? err.message : "장소 정보를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mainImage = images[0] ?? null;

  const startEditPhoto = () => {
    setPhotoUrlDraft(mainImage?.originalUrl ?? "");
    setEditingPhoto(true);
  };

  const savePhoto = async () => {
    const originalUrl = photoUrlDraft.trim();
    if (!originalUrl) return;
    setSavingPhoto(true);
    try {
      if (mainImage) {
        const updated = await updatePlaceImage(mainImage.id, { originalUrl });
        setImages((prev) => [
          { id: updated.id, originalUrl: updated.originalUrl, thumbnailUrl: updated.thumbnailUrl, displayOrder: updated.displayOrder },
          ...prev.slice(1),
        ]);
      } else {
        const created = await createPlaceImage({ originalUrl, displayOrder: 0 });
        setImages([
          { id: created.id, originalUrl: created.originalUrl, thumbnailUrl: created.thumbnailUrl, displayOrder: created.displayOrder },
        ]);
      }
      setEditingPhoto(false);
      showToast("사진이 저장되었습니다.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "사진 저장에 실패했습니다.", "error");
    } finally {
      setSavingPhoto(false);
    }
  };

  const removePhoto = async () => {
    if (!mainImage) return;
    try {
      await deletePlaceImage(mainImage.id);
      setImages((prev) => prev.filter((img) => img.id !== mainImage.id));
      showToast("사진이 삭제되었습니다.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "사진 삭제에 실패했습니다.", "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updatePlace({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        homepage: form.homepage.trim() || null,
        overview: form.overview.trim() || null,
      });
      setPlace(res);
      showToast("장소 정보가 저장되었습니다.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = async () => {
    try {
      const created = await createBenefit({ title: "새 혜택", isActive: true });
      setBenefits((prev) => [...prev, created]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "혜택 추가에 실패했습니다.", "error");
    }
  };

  const updateBenefitTitle = (id: number, title: string) => {
    setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, title } : b)));
  };

  const commitBenefitTitle = async (id: number, title: string) => {
    try {
      const updated = await updateBenefit(id, { title });
      setBenefits((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "혜택 수정에 실패했습니다.", "error");
    }
  };

  const removeBenefit = async (id: number) => {
    try {
      await deleteBenefit(id);
      setBenefits((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "혜택 삭제에 실패했습니다.", "error");
    }
  };

  if (loading) {
    if (!showSkeleton) return null;
    return (
      <div className="place-page">
        <PageHeader
          title="장소 관리"
          icon={<img src="/assets/place-manage.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
          iconPlain
          hideSettings
        />
        <Skeleton height={280} />
      </div>
    );
  }

  return (
    <div className="place-page">
      <PageHeader
        icon={<img src="/assets/place-manage.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
        iconPlain
        title="장소 관리"
        hideSettings
      />

      <div className="stack">
      <section className="panel place-card">
        <div className="card-head" style={{ marginBottom: 20 }}>
          <span className="card-head-icon">
            <Store size={18} />
          </span>
          <div>
            <p className="card-head-title">기본 정보</p>
            <p className="card-head-desc">장소의 기본 정보를 입력해주세요.</p>
          </div>
        </div>

        <div className="place-basic-layout">
          <div className="place-field-grid">
            <Field
              label="장소 이름"
              required
              icon={<Store size={16} />}
              placeholder="장소 이름을 입력해주세요."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Field
              label="카테고리"
              icon={<LayoutGrid size={16} />}
              placeholder="선택해주세요"
              value={place?.category?.name ?? ""}
              disabled
            />
            <Field
              label="주소"
              icon={<MapPin size={16} />}
              placeholder="주소 정보가 없습니다."
              value={place?.roadAddress ?? place?.lotAddress ?? ""}
              disabled
            />
            <Field
              label="전화번호"
              icon={<Phone size={16} />}
              placeholder="전화번호를 입력해주세요."
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Field
                label="공식 홈페이지"
                icon={<Link2 size={16} />}
                placeholder="홈페이지 주소를 입력해주세요. (선택)"
                value={form.homepage}
                onChange={(e) => setForm((f) => ({ ...f, homepage: e.target.value }))}
              />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">소개</label>
              <div className="field-input-wrap field-textarea-wrap">
                <span className="field-icon">
                  <FileText size={16} />
                </span>
                <textarea
                  className="field-input field-textarea"
                  maxLength={500}
                  placeholder="장소에 대한 소개를 입력해주세요. (선택)"
                  value={form.overview}
                  onChange={(e) => setForm((f) => ({ ...f, overview: e.target.value }))}
                />
              </div>
              <p className="hours-footnote">{form.overview.length} / 500자</p>
            </div>
          </div>

          <div className="place-photo-panel">
            <p className="card-head-title">대표 사진</p>
            <p className="card-head-desc" style={{ marginBottom: 4 }}>
              장소를 대표하는 사진을 등록해주세요.
            </p>
            {(!editingPhoto || mainImage) && (
              <div
                className="place-photo-hero"
                style={mainImage ? { backgroundImage: `url(${mainImage.originalUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {!editingPhoto && !mainImage && (
                  <div className="place-photo-empty">
                    <span className="place-photo-empty-icon">
                      <Camera size={22} />
                    </span>
                    <p className="place-photo-empty-title">사진을 등록해주세요.</p>
                    <p className="place-photo-empty-desc">이미지 URL로 등록할 수 있어요.</p>
                    <Button onClick={startEditPhoto}>사진 등록</Button>
                  </div>
                )}
                {!editingPhoto && mainImage && (
                  <button type="button" className="place-photo-change-btn" onClick={startEditPhoto}>
                    <Camera size={15} /> 사진 변경
                  </button>
                )}
              </div>
            )}
            {editingPhoto ? (
              <div className="place-photo-url-row">
                <input
                  className="text-input"
                  placeholder="이미지 URL을 입력하세요"
                  value={photoUrlDraft}
                  onChange={(e) => setPhotoUrlDraft(e.target.value)}
                />
                <Button onClick={savePhoto} disabled={savingPhoto || !photoUrlDraft.trim()}>
                  {savingPhoto ? "저장 중..." : "저장"}
                </Button>
                <Button variant="secondary" onClick={() => setEditingPhoto(false)}>
                  취소
                </Button>
              </div>
            ) : (
              mainImage && (
                <button type="button" className="place-photo-remove" onClick={removePhoto}>
                  <Trash2 size={13} /> 사진 삭제
                </button>
              )
            )}
          </div>
        </div>

      </section>

      <section className="panel place-card">
        <div className="card-head" style={{ marginBottom: 16 }}>
          <span className="card-head-icon">
            <Gift size={18} />
          </span>
          <div>
            <p className="card-head-title">방문 혜택</p>
            <p className="card-head-desc">해당 장소에서 제공하는 혜택을 등록해주세요.</p>
          </div>
        </div>
        <ul className="place-benefit-list">
          {benefits.map((b) => (
            <li key={b.id}>
              <span className="place-benefit-icon">
                <Check size={13} />
              </span>
              <input
                className="place-benefit-input"
                value={b.title}
                placeholder="혜택 내용을 입력하세요"
                onChange={(e) => updateBenefitTitle(b.id, e.target.value)}
                onBlur={(e) => commitBenefitTitle(b.id, e.target.value)}
              />
              <button
                type="button"
                className="place-benefit-remove"
                aria-label="혜택 삭제"
                onClick={() => removeBenefit(b.id)}
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
        <Button type="button" icon={<Plus size={14} />} onClick={addBenefit} style={{ marginTop: 16 }}>
          혜택 추가
        </Button>
      </section>
      </div>

      <div className="place-footer">
        <div className="report-actions">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
