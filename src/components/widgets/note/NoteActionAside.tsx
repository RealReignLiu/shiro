'use client'

import { m, useAnimationControls, useForceUpdate } from 'framer-motion'

import { MotionButtonBase } from '~/components/ui/button'
import { useIsClient } from '~/hooks/common/use-is-client'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { toast } from '~/lib/toast'
import { urlBuilder } from '~/lib/url-builder'
import {
  getCurrentNoteData,
  setCurrentNoteData,
  useCurrentNoteDataSelector,
} from '~/providers/note/CurrentNoteDataProvider'
import { useCurrentNoteId } from '~/providers/note/CurrentNoteIdProvider'
import { useModalStack } from '~/providers/root/modal-stack-provider'
import { isLikedBefore, setLikeId } from '~/utils/cookie'
import { clsxm } from '~/utils/helper'
import { apiClient } from '~/utils/request'

import { ActionAsideContainer } from '../shared/ActionAsideContainer'
import { DonateButton } from '../shared/DonateButton'
import { ShareModal } from '../shared/ShareModal'

export const NoteActionAside: Component = ({ className }) => {
  return (
    <ActionAsideContainer className={className}>
      <LikeButton />
      <ShareButton />
      <DonateButton />
    </ActionAsideContainer>
  )
}

const LikeButton = () => {
  const control = useAnimationControls()
  const [update] = useForceUpdate()

  const id = useCurrentNoteDataSelector((data) => data?.data.id)
  const nid = useCurrentNoteId()
  if (!id) return null
  const handleLike = () => {
    if (isLikedBefore(id)) return
    if (!nid) return
    apiClient.note.likeIt(id).then(() => {
      setLikeId(id)
      setCurrentNoteData((draft) => {
        draft.data.count.like += 1
      })
      update()
    })
  }

  const isLiked = isLikedBefore(id)

  return (
    <MotionButtonBase
      aria-label="Like This Note Button"
      className="flex flex-col space-y-2"
      onClick={() => {
        handleLike()
        control.start('tap', {
          repeat: 5,
        })
        toast('谢谢你！', undefined, {
          iconElement: (
            <m.i
              className="icon-[mingcute--heart-fill] text-uk-red-light"
              initial={{
                scale: 0.96,
              }}
              animate={{
                scale: 1.22,
              }}
              transition={{
                easings: ['easeInOut'],
                delay: 0.3,
                repeat: 5,
                repeatDelay: 0.3,
              }}
            />
          ),
        })
      }}
    >
      <m.i
        className={clsxm(
          'text-[24px] opacity-80 duration-200 hover:text-uk-red-light hover:opacity-100',
          !isLiked && 'icon-[mingcute--heart-line]',
          isLiked && 'icon-[mingcute--heart-fill] text-uk-red-light',
        )}
        animate={control}
        variants={{
          tap: {
            scale: 1.3,
          },
        }}
        transition={{
          easings: ['easeInOut'],
        }}
      />
    </MotionButtonBase>
  )
}

const ShareButton = () => {
  const isClient = useIsClient()
  const { present } = useModalStack()

  if (!isClient) return null

  return (
    <MotionButtonBase
      aria-label="Share This Note Button"
      className="flex flex-col space-y-2"
      onClick={() => {
        const note = getCurrentNoteData()?.data

        if (!note) return

        const hasShare = 'share' in navigator

        const title = '分享一片宝藏文章'
        const url = urlBuilder(
          routeBuilder(Routes.Note, {
            id: note.nid.toString(),
          }),
        ).href

        const text = `嘿，我发现了一片宝藏文章「${note.title}」哩，快来看看吧！${url}`

        if (hasShare)
          navigator.share({
            title: note.title,
            text: note.text,
            url,
          })
        else {
          present({
            title: '分享此内容',
            content: () => <ShareModal text={text} title={title} url={url} />,
          })
        }
      }}
    >
      <i className="icon-[mingcute--share-forward-line] text-[24px] opacity-80 duration-200 hover:text-uk-cyan-light hover:opacity-100" />
    </MotionButtonBase>
  )
}
