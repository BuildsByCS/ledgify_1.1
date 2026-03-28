import Image from 'next/image'
import { forwardRef } from 'react'

const Card = forwardRef(({ id, frontSrc, frontAlt,count, title, para }, ref) => {
  return (
    <div ref={ref} className='card' id={id}>
      <div className='card-wrapper'>
        <div className='card-inner'>
          <div className="card-front">
            <Image
              priority
              src={frontSrc}
              alt={frontAlt}
              width={500}
              height={500}
              draggable={false}
            />
          </div>
          <div className="card-back">
            <div className='flex flex-col h-[100%] justify-between'>
              <h3 className='large-text'>{count}</h3>
              <div>
                <h4 className='mid-text pb-[1em] leading-tight'>{title}</h4>
                <p className='small-text leading-none'>{para}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
})

Card.displayName = "Card";

export default Card